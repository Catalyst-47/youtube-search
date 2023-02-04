const db = require("../models")

const Video = db.videos

exports.getVideos = (req, res) => {
    let page = 0
    let skipValue = 0
    // Page numbers start from 1, but offset starts from 0 for Mongo.
    if (req.query.page !== undefined) {
      if (isNaN(req.query.page)) {
        return res.status(500).json({ error: 'Only integers allowed for page!' })
      }
      page = req.query.page - 1
      skipValue = page * 25
    }

    Video.find().sort({ publish_time: -1 }).skip(skipValue).limit(25)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving videos.",
            });
          });
}