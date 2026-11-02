require('dotenv').config();

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const MATCH_ID = process.env.MATCH_ID;

async function main() {

  console.log('\n========== JSON EVENTS ==========\n');

  const eventIds = await redis.smembers(
    `match:${MATCH_ID}:processed`
  );

  console.log(`Found ${eventIds.length} processed events`);

  for (const eventId of eventIds.slice(0, 3)) {

    const event = await redis.json.get(
      `event:${eventId}`,
      '$'
    );

    console.log(`\nEvent ${eventId}:`);
    console.dir(event, { depth: null });
  }

  console.log('\n=================================\n');
}

main().catch(error => {
  console.error('Redis JSON error:', error);
});