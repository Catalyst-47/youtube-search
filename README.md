# Fampay-Assignment

# Prerequisite
- Install docker
- If running outside docker container
  - Install Mongo (https://www.mongodb.com/docs/manual/installation/)
  - Install Redis (https://redis.io/docs/getting-started/installation/)
  - Install Node v 19 (https://nodejs.org/en/download/)
  - Install npm (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
  
# Setup locally
- Clone project to your local using git clone
- `cd into root folder of the project`
- Run `touch .env`
- Copy .env.sample content into .env file
- With Docker
  - Start docker on local
  - Run `docker-compose up --build`
  - When the build is done you can see `Server is up and running on PORT` printed on console
  - It's recommended to set these env variables 
    - GOOGLE_AUTH_KEYS, YT_SEARCH_QUERY, GOOGLE_API_REFRESH_INTERVAL, 
- Without Docker
  - Start mongo server and redis server on local
  - Set env variables in .env file as per your configurations
  - Run `npm install`
  - Run `npm start` or `node server.js`
  
# ENV variable
- GOOGLE_AUTH_KEYS : You can give `|` separated values for mulitple api keys

# How does this work?
- Components
  - Express app
  - MongoDB
  - Redis
  
- We spin off a express server which connects with MongoDB and Redis
- We call fetchData periodically for the given time interval to get the data from Youtube API and store it in MongoDB
- We have two apis 
  - To get video details with pagination (Defaults to Page 1)
  - To search videos based on Title and Description
  
- Get video api first checks in Redis with key as Page_${page_no} anf if it is able to find it will return it or else it will search in mongo and set redis cache with TTL of 300 seconds and return the data
- Search api have the same flow as above but the key here would be the search string in redis


# API
## GET VIDEO WITH PAGINATION
```
  URL: /api/videos?page=1
  METHOD: GET
  Query Params: page=number (optional)
  
  Sample request:
  curl --location --request GET 'HOST:PORT/api/videos?page=1'
  
  Sample response:
  {
    "message": "Data fetched successfully!",
    "result": [
        {
            "_id": "63df628beea8bbc5792de602",
            "video_id": "w6u5A2PApNA",
            "title": "Former Cricketer Vinod Kambli Booked For Assaulting His Wife",
            "description": "Former Indian cricketer Vinod Kambli has been booked by the Mumbai Police for allegedly assaulting his wife. Kambli's wife ...",
            "thumbnail": "https://i.ytimg.com/vi/w6u5A2PApNA/hqdefault.jpg",
            "channel_id": "UCYPvAwZP8pZhSMW8qs7cVCw",
            "channel_title": "India Today",
            "publish_time": "2023-02-05T06:45:29.000Z"
        },....]
   }
```
## SEARCH VIDEO BY TITLE OR DESCRIPTION
```
  URL: /api/videos/search?searchString=<SEARCH STRING>
  METHOD: GET
  Query Params: searchString (Space separated or `|` separated
  
  Sample request:
  curl --location --request GET 'HOST:PORT/api/videos/search?searchString=kohli virat'
  
  Sample response:
  {
    "message": "Data fetched successfully!",
    "result": [
        {
            "_id": "63df63179e9863baa7d47fa3",
            "video_id": "-bm-6M4jD-I",
            "title": "Cricket Team India | क्या Virat Kohli और Rohit Sharma अब नहीं होंगे Hardik Pandya की T20 टीम में",
            "description": "Cricket Team India | क्या Virat Kohli और Rohit Sharma अब नहीं होंगे Hardik Pandya की T20 टीम में ...",
            "thumbnail": "https://i.ytimg.com/vi/-bm-6M4jD-I/hqdefault.jpg",
            "channel_id": "UC5ebo42ydvAayGn2Z4Lf9XA",
            "channel_title": "Uncut",
            "publish_time": "2023-02-04T16:30:09.000Z"
        },....]
   }
```
  
  
