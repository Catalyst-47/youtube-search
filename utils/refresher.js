const db = require("../models")
const googleapis = require('googleapis')
const Video = db.videos


const authKeys = process.env.GOOGLE_AUTH_KEYS.split("|")
let gapi = new googleapis.youtube_v3.Youtube({
    auth: authKeys.shift() // Pop and take the first element in an array, when exhausted shift to next, and so on
  })

let pageToken = null

const params = {
    part: ['snippet'],
    maxResults: 50,
    order: 'date',
    type: ['video'],
    publishedAfter: '2022-01-01T00:00:00Z',
    q: process.env.YT_SEARCH_QUERY,
}

exports.fetchData = () => {
    if(pageToken != null) {
        params.pageToken = pageToken
    }
    console.log(params)
    gapi.search.list(params)
                .then(response => {
                    pageToken = response.data.nextPageToken
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
                        const newApiKey = authKeys.shift()
                        gapi = new googleapis.youtube_v3.Youtube({
                          auth: newApiKey // Replace old API key with the newer one
                        })
                        console.log(`Quota exceeded for current API key. Updating to new API key: ${newApiKey}`)
                      } else {
                        console.error(err)
                      }
                })
}