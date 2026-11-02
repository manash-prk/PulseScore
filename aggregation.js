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

  console.log('\n======================================');
  console.log('REDIS SEARCH AGGREGATION');
  console.log('======================================');


  // 1. COUNT EVENTS
  console.log('\n========== TOTAL EVENTS ==========');

  const totalEvents = await index.aggregate({
    aggregations: {
      totalEvents: {
        $count: {
          field: 'eventId'
        }
      }
    }
  });

  console.dir(totalEvents, { depth: null });


  // 2. EVENTS BY TYPE
  console.log('\n========== EVENTS BY TYPE ==========');

  const eventsByType = await index.aggregate({
    aggregations: {
      eventTypes: {
        $terms: {
          field: 'type',
          size: 10
        }
      }
    }
  });

  console.dir(eventsByType, { depth: null });


  // 3. EVENTS BY TEAM
  console.log('\n========== EVENTS BY TEAM ==========');

  const eventsByTeam = await index.aggregate({
    aggregations: {
      teams: {
        $terms: {
          field: 'team',
          size: 10
        }
      }
    }
  });

  console.dir(eventsByTeam, { depth: null });


  // 4. AVERAGE EVENT MINUTE
  console.log('\n========== AVERAGE EVENT MINUTE ==========');

  const averageMinute = await index.aggregate({
    aggregations: {
      averageMinute: {
        $avg: {
          field: 'minute'
        }
      }
    }
  });

  console.dir(averageMinute, { depth: null });


  // 5. EVENT MINUTE STATISTICS
  console.log('\n========== EVENT MINUTE STATISTICS ==========');

  const minuteStats = await index.aggregate({
    aggregations: {
      minuteStats: {
        $stats: {
          field: 'minute'
        }
      }
    }
  });

  console.dir(minuteStats, { depth: null });


  // 6. GOAL COUNT
  console.log('\n========== GOAL COUNT ==========');

  const goalCount = await index.aggregate({
    filter: {
      type: 'goal'
    },

    aggregations: {
      goals: {
        $count: {
          field: 'eventId'
        }
      }
    }
  });

  console.dir(goalCount, { depth: null });


  console.log('\n======================================');
}

main().catch(error => {

  console.error('\nAggregation error:');
  console.error(error);

});