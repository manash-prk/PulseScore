require('dotenv').config();

const { Redis, s } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

async function createEventIndex() {
  try {

    const index = await redis.search.createIndex({
      name: 'eventIndex',
      dataType: 'json',
      prefix: 'event:',

      existsOk: true,

      schema: s.object({

        eventId: s.keyword(),

        matchId: s.keyword(),

        type: s.keyword(),

        team: s.keyword(),

        player: s.string(),

        minute: s.number(),

        homeScore: s.number(),

        awayScore: s.number(),

        timestamp: s.number()
      })
    });

    console.log('Event index created successfully.');

    console.log('\nWaiting for existing events to be indexed...');

    await index.waitIndexing();

    console.log('Indexing completed.');

  } catch (error) {

    console.error(
      'Index creation failed:',
      error.message
    );
  }
}

createEventIndex();