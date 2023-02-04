const db = require("../models")
const redisClient = require("../redis")

const Video = db.videos

exports.getVideos = (req, res) => {
    let page = 0
    let skip = 0
    // Page numbers start from 1, but offset starts from 0 for Mongo.
    if (req.query.page !== undefined) {
        if (isNaN(req.query.page)) {
            return res.status(500).json({ error: 'Only integers allowed for page!' })
        }
        page = req.query.page - 1
        skip = page * 25
    }

    const redisKey = `page_${page}`

    redisClient.get(redisKey, (err, redisData) => {
        if (err) {
            res.send(500).json({ error: err })
        } else {
            //If data doesn't exist in redis then fetch from mongo
            if (redisData === null) {
                Video.find().sort({ publish_time: -1 }).skip(skip).limit(25)
                    .then((data) => {
                        // Set cahce data in redis for the page_no
                        //TTL is 300 seconds then redis will invalidate
                        redisClient.set(redisKey, JSON.stringify(data), 'EX', 300).then(res => {
                            console.log(`Successfully set key: ${redisKey} to Redis.`)
                        }).catch(err => {
                            console.error(`Error setting key: ${redisKey} to Redis. Error: ${err}`)
                        })
                        res.status(200).json({ message: 'Data fetched successfully!', result: data })
                    })
                    .catch((err) => {
                        res.status(500).send({ error: err.message || "Some error occurred while retrieving videos." });
                    });
            } else {
                //If data exist in redis then send back same
                res.status(200).json({ message: 'Cached data fetched successfully!', result: JSON.parse(redisData) })
            }
        }
    })
}

exports.searchVideos = (req, res) => {
    const searchString = req.query.searchString;
    if (searchString === undefined || searchString === null) {
        res.status(400).json({ error: 'Please provide some search string!' })
    } else {
        redisClient.get(searchString, (err, redisData) => {
            if (err) {
                res.status(500).json({ error: err })
            } else {
                //If data doesn't exist in redis then fetch from mongo
                if (redisData === null) {
                    const searchStringRegexp = new RegExp(searchString.replace(' ', '|'))
                    Video.find({
                        $text: {
                            $search: searchStringRegexp,
                            $caseSensitive: false
                        }
                    }).sort({ publish_time: -1 }).limit(50).then(data => {
                        // Set cahce data in redis for the search string
                        //TTL is 300 seconds then redis will invalidate
                        redisClient.set(searchString, JSON.stringify(data), 'EX', 300).then(res => {
                            console.log(`Successfully set key: ${searchString} to Redis. Result: ${data}`)
                        }).catch(err => {
                            console.error(`Error setting key: ${searchString} to Redis. Error: ${err}`)
                        })
                        res.status(200).json({ message: 'Data fetched successfully!', result: data })
                    }).catch(err => {
                        res.status(500).json({ error: err })
                    })
                } else {
                    //If data exist in redis then send back same
                    res.status(200).json({ message: 'Cached data fetched successfully!', result: JSON.parse(redisData)})
                }
            }
        })

    }
}