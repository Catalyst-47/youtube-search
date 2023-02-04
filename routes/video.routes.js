module.exports = app => {
    const videos = require("../controllers/video.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.get("/", videos.getVideos);
  
    app.use('/api/videos', router);
  };