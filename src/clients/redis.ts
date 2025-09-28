import Redis  from "ioredis"

const redisClient = new Redis({
    host: "localhost",
    port: 6379
});

redisClient.on('error', (err: Error)=> {
    console.error('Error connecting to redis:', err);
})


export default redisClient;