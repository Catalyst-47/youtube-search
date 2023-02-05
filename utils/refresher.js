const db = require("../models")
const googleapis = require('googleapis')
const Video = db.videos

let start_index = 0


const authKeys = process.env.GOOGLE_AUTH_KEYS.split("|")
let gapi = new googleapis.youtube_v3.Youtube({
    auth: authKeys[start_index] // start from 0 index
  })

let nextPageToken = null

const params = {
    part: ['snippet'],
    maxResults: 50,
    order: 'date',
    type: ['video'],
    publishedAfter: '2022-01-01T00:00:00Z',
    q: process.env.YT_SEARCH_QUERY,
}

exports.fetchData = () => {
    //If not first time fetching data then set the page token
    if(nextPageToken != null) {
        params.pageToken = nextPageToken
    }
    gapi.search.list(params)
                .then(response => {
                    // store the next page token for next fetch
                    nextPageToken = response.data.nextPageToken
                    const resultSet = response.data.items.map(item => ({
                        video_id: item.id.videoId,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel_id: item.snippet.channelId,
                        channel_title: item.snippet.channelTitle,
                        publish_time: item.snippet.publishTime
                    }))
                    
                    Video.insertMany(resultSet, { ordered: false })
                            .then(res => {
                                console.log("Data Refreshed Successfully!")
                            })
                            .catch(err => {
                                console.log(`Failed to refresh! Retrying in ${process.env.GOOGLE_API_REFRESH_INTERVAL}s. Error:\n${err}`)
                            })
                }).catch(err => {
                    if (err.message.includes("exceeded") && authKeys.length) {
                        start_index++
                        const newApiKey = authKeys[start_index % authKeys.length] // Rotate on the same api keys list when you reach at the last index
                        gapi = new googleapis.youtube_v3.Youtube({
                          auth: newApiKey // Replace old API key with the newer one
                        })
                        console.log(`Quota exceeded for current API key. Updating to new API key: ${newApiKey}`)
                      } else {
                        console.error(err)
                      }
                })
}