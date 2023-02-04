require('dotenv').config()
const express = require("express");
const cors = require("cors");
const db = require("./models");
const refresher = require("./utils/refresher");
const app = express();
const redisClient = require("./redis")


require("./routes/video.routes")(app);

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Will fetch data first time
refresher.fetchData()


// Will fetch data in priodical interval of configured seconds
setInterval(refresher.fetchData, process.env.GOOGLE_API_REFRESH_INTERVAL * 1000)


// Connect to mongo database
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


// Connect to redis
redisClient.on('connect', () => {
console.log('Redis connection established successfully.')
})

redisClient.on('error', error => {
console.log(`Redis connection couldn't be established. ${JSON.stringify(error)}`)
})



// set port, listen for requests
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST
app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}.`);
});