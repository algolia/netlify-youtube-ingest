require('dotenv').config()
const axios = require('axios')
const YOUTUBE_KEY = process.env.YOUTUBE_KEY

// Initialize the algolia client
const algolia = require('algoliasearch')
const client = algolia(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)

const handler = async () => {
  try {
    // Get the records from the algolia index
    const index = client.initIndex(process.env.VIDEO_INDEX)
    const hits = await index.search('', {
        attributesToRetrieve: ['objectId'],
        hitsPerPage: 1000,
    })
    const videoIds = hits.hits.map(record => record.objectID)

    // If the length of videoIds is longer than 50, split it into chunks of 50
    const chunks = videoIds.reduce((acc, val, i) => {
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
            return axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk.join(',')}&key=${YOUTUBE_KEY}`)
        })
        const responses = await Promise.all(promises)
        var data = responses.map(response => response.data.items).flat()
    } else {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${YOUTUBE_KEY}`)
        var data = response.data.items
    }
    
    const normalizedVideos = data.map(video => {
        const {statistics} = video
        return {
            likes: statistics.likeCount,
            favoriteCount: statistics.favoriteCount,
            viewCount: statistics.viewCount,
            commentCount: statistics.commentCount,
            objectID: video.id,
        }
      })
      console.log(normalizedVideos[0])
      // Update the records in the algolia index
      const saveStatus = await index.partialUpdateObjects(normalizedVideos, {createIfNotExists: true})
    return {
        statusCode: 200,
        body: JSON.stringify({...saveStatus, message: `Counts updated for ${saveStatus.objectIDs.length} videos`})
    }
  } catch (error) {
    console.log(error)
    return {
        statusCode: 500,
        body: JSON.stringify({error, message: error})
    }
  }
}

    module.exports = { handler }
