require('dotenv').config();

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const MATCH_ID = process.env.MATCH_ID;

async function repairState() {

  const events = await redis.lrange(
    `match:${MATCH_ID}:events`,
    0,
    -1
  );

  let homeScore = 0;
  let awayScore = 0;

  for (const event of events) {

    if (
      event.homeScore !== null &&
      event.homeScore !== undefined
    ) {
      homeScore = Number(event.homeScore);
    }

    if (
      event.awayScore !== null &&
      event.awayScore !== undefined
    ) {
      awayScore = Number(event.awayScore);
    }
  }

  await redis.hset(
    `match:${MATCH_ID}:state`,
    {
      matchId: String(MATCH_ID),
      homeScore,
      awayScore,
      lastUpdate: Date.now()
    }
  );

  console.log('Match state repaired.');

  console.log({
    matchId: MATCH_ID,
    homeScore,
    awayScore
  });
}

repairState().catch(error => {
  console.error('Repair error:', error);
});