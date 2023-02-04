module.exports = app => {
    const videos = require("../controllers/video.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.get("/", videos.getVideos);
    router.get("/search", videos.searchVideos)
  
    app.use('/api/videos', router);
  };