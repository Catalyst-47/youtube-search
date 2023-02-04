const Redis = require("ioredis").Redis

const redisClient = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST, { enableAutoPipelining: true })

module.exports = redisClient