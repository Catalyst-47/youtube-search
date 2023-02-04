module.exports = app => {
    const videos = require("../controllers/video.controller.js");
  
    var router = require("express").Router();
  
    // Get video with pagination
    router.get("/", videos.getVideos);

    // Search video with Title or Description
    router.get("/search", videos.searchVideos)
  
    app.use('/api/videos', router);
  };