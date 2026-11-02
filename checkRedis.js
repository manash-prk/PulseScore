require('dotenv').config();

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const MATCH_ID = process.env.MATCH_ID;

async function main() {

  console.log('\n========== MATCH STATE ==========');

  const state = await redis.hgetall(
    `match:${MATCH_ID}:state`
  );

  console.log(state);


  console.log('\n========== EVENT HISTORY ==========');

  const events = await redis.lrange(
    `match:${MATCH_ID}:events`,
    0,
    10
  );

  console.log(events);


  console.log('\n========== STATISTICS ==========');

  const stats = await redis.hgetall(
    `match:${MATCH_ID}:stats`
  );

  console.log(stats);


  console.log('\n========== PROCESSED EVENTS ==========');

  const processed = await redis.smembers(
    `match:${MATCH_ID}:processed`
  );

  console.log(processed);


  console.log('\n====================================');
}

main().catch(console.error);