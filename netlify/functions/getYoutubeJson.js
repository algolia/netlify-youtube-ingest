require('dotenv').config()
const axios = require('axios')
const YOUTUBE_KEY = process.env.YOUTUBE_KEY

// Initialize the algolia client
const algolia = require('algoliasearch')
const client = algolia(process.env.VITE_ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)

// function to loop through all pages in the youtube api and get video ids
const getAllVideoIds = async (channelId, maxResults=20) => {
  let videoIds = []
  let nextPageToken = ''
  let page = 1
  while (nextPageToken !== undefined) {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&pageToken=${nextPageToken}`)
    videoIds = videoIds.concat(response.data.items.map(item => item.id.videoId))
    nextPageToken = response.data.nextPageToken
    page++
  }
  return videoIds
}



const handler = async (event) => {
  try {
    // Destructure the query parameters
    const {channelId, maxResults=20, index=true} = JSON.parse(event.body)
    const allVideoIds = await getAllVideoIds(channelId, maxResults)
    const allVideoIdsFiltered = allVideoIds.filter(id => id !== undefined)
    console.log(allVideoIdsFiltered)
    // If the length of videoIds is longer than 50, split it into chunks of 50
    const chunks = allVideoIdsFiltered.reduce((acc, val, i) => {
      if (i % 50 === 0) {
          acc.push([val])

      } else {
          acc[acc.length - 1].push(val)
      }
      return acc
  }, [])
  // if chunks length is greater than 1, then we need to make multiple requests
  if (chunks.length > 1) {
      const promises = chunks.map(chunk => {
          return axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${chunk.join(',')}&key=${YOUTUBE_KEY}`)
      })
      const responses = await Promise.all(promises)
      var videoData = responses.map(response => response.data.items).flat()
  } else {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${YOUTUBE_KEY}`)
      var videoData = response.data.items
  }
    
    
    
    
    
    
    // // Get a list of videos from the YouTube API
    // const videoList = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_KEY}&type=video&maxResults=${maxResults}&q=&channelId=${channelId}&order=date`)
    // // Get the data from the videos
    // const {items} = videoList.data
    // // // Create an array of ids to fetch more data from the YouTube API
    // const videoIds = items.map(item => item.id.videoId)
    // console.log(videoIds)
    // // Fetch data on all the ids
    // const fetchUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_KEY}&part=snippet,statistics&id=${videoIds.join(',')}`
    // const videoData = await axios.get(fetchUrl)
    
    // Get the data from the videos
    // const {items: videos} = videoData.data

    // Create an array of objects to push to the Algolia index
    const normalizedVideos = videoData.map(video => {
      const {snippet, statistics} = video
      return {
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high.url,
        publishDate: snippet.publishedAt,
        likes: statistics.likeCount,
        favoriteCount: statistics.favoriteCount,
        viewCount: statistics.viewCount,
        commentCount: statistics.commentCount,
        objectID: video.id,
        tags: snippet.tags
      }
    })
    if (index) {
      // Index the videos to algolia
      const index = client.initIndex(process.env.VIDEO_INDEX)
      // save or update the videos in index
      try {
        // Save the video data to the index
        await index.saveObjects(normalizedVideos)
        return {
          statusCode: 200,
          body: JSON.stringify({normalizedVideos, message: `${normalizedVideos.length} videos saved to the index`})
        }
      } catch(err) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Error saving videos to algolia' + JSON.stringify(err)
          })
        }
      }
      
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify(normalizedVideos)
      }
    }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
