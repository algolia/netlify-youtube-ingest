require('dotenv').config()
const axios = require('axios')
const YOUTUBE_KEY = process.env.YOUTUBE_KEY

// Initialize the algolia client
const algolia = require('algoliasearch')
const client = algolia(process.env.VITE_ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)

const handler = async (event) => {
  try {
    // Get the url from the event body
    const { videoUrl, index = true } = JSON.parse(event.body)

    // get id from youtube url
    const id = videoUrl.split('v=')[1].split('&')[0]
    // Build the URL to fetch
    const fetchUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_KEY}&part=snippet,statistics&id=${id}`
    // Get the video data from youtube
    const videoData = await axios.get(fetchUrl)
    // Get the video data from youtube, it comes as an array
    const { items: videos } = videoData.data
    const { snippet, statistics } = videos[0]
    const { title, description, thumbnails } = snippet
    const { viewCount, likeCount, favoriteCount, commentCount } = statistics
    // Build the object to be indexed
    const dataForIndex = {
      title,
      description,
      thumbnail: thumbnails.high.url,
      publishDate: snippet.publishedAt,
      viewCount,
      likeCount,
      favoriteCount,
      commentCount,
      videoUrl,
      tags: snippet.tags,
      objectID: id
    }
    if (index) {
      // If the index value is passed, index the object
      const index = client.initIndex(process.env.VIDEO_INDEX)
      // save or update the videos in index
      try {
        // Index the object, though it needs to be an array
        const response = await index.saveObjects([dataForIndex])

        return {
          statusCode: 200,
          body: JSON.stringify({message: `Data indexed for ${dataForIndex.title}`, ...dataForIndex})
        }
      } catch (err) {
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
        body: JSON.stringify(dataForIndex)
      }
    }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }