import Redis  from "ioredis"
import dotenv from 'dotenv';
dotenv.config();

const RedisUrl = process.env.REDIS_URL;
const redisClient = new Redis(RedisUrl as string);

redisClient.on('error', (err: Error)=> {
    console.error('Error connecting to redis:', err);
})


export default redisClient;