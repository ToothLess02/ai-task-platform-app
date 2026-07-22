const Redis = require('ioredis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || '';

const redisClient = new Redis({
  host: redisHost,
  port: parseInt(redisPort, 10),
  password: redisPassword || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => {
  console.log(`[Redis] Connected to Redis queue server`);
});

redisClient.on('error', (err) => {
  console.error(`[Redis Error] ${err.message}`);
});

const TASK_QUEUE_KEY = process.env.REDIS_QUEUE_NAME || 'ai_task_queue';

const pushTaskToQueue = async (taskData) => {
  await redisClient.rpush(TASK_QUEUE_KEY, JSON.stringify(taskData));
};

module.exports = {
  redisClient,
  pushTaskToQueue,
  TASK_QUEUE_KEY,
};
