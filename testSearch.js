require('dotenv').config();

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

async function main() {

  const index = redis.search.index({
    name: 'eventIndex'
  });

  console.log('\n========== ALL EVENTS ==========\n');

  const allEvents = await index.query({
    filter: {
      matchId: process.env.MATCH_ID
    },
    limit: 20
  });

  console.dir(allEvents, { depth: null });


  console.log('\n========== GOALS ==========\n');

  const goals = await index.query({
    filter: {
      type: 'goal'
    },
    limit: 20
  });

  console.dir(goals, { depth: null });


  console.log('\n========== HOME EVENTS ==========\n');

  const homeEvents = await index.query({
    filter: {
      team: 'home'
    },
    limit: 20
  });

  console.dir(homeEvents, { depth: null });


  console.log('\n========== EVENTS AFTER 60 MINUTES ==========\n');

  const lateEvents = await index.query({
    filter: {
      minute: {
        $gte: 60
      }
    },
    limit: 20
  });

  console.dir(lateEvents, { depth: null });


  console.log('\n=================================\n');
}

main().catch(error => {
  console.error('Search error:', error);
});