// This is a standalone test - just proving Redis works, nothing to do
// with sports data yet. If this runs without errors, Redis is ready.

require('dotenv').config();
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function main() {
  console.log('Trying to write to Redis...');
  await redis.set('testKey', 'hello from my scoreboard project');
  console.log('Write succeeded.');

  console.log('Trying to read it back...');
  const value = await redis.get('testKey');
  console.log('Read succeeded. Value is:', value);

  console.log('\nRedis connection is working!');
}

main().catch(err => console.error('Something went wrong:', err.message));
