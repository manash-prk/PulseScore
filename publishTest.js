require('dotenv').config();

const { Redis } = require('@upstash/redis');

const redis = new Redis({

  url:
    process.env.UPSTASH_REDIS_REST_URL,

  token:
    process.env.UPSTASH_REDIS_REST_TOKEN

});


const DEFAULT_MATCH_ID =
  process.env.MATCH_ID || null;


const GLOBAL_CHANNEL =
  'scoreboard:updates';


async function publishTest() {

  let matchId =
    await redis.get(
      'scoreboard:activeMatch'
    );


  if (!matchId) {
    matchId =
      DEFAULT_MATCH_ID;
  }


  if (!matchId) {

    console.error(
      'No active match selected.'
    );

    return;

  }


  const state =
    await redis.hgetall(
      `match:${matchId}:state`
    );


  let homeScore =
    Number(state.homeScore || 0);

  let awayScore =
    Number(state.awayScore || 0);


  /*
    You can change this:

      goal
      yellow_card
      red_card
      substitution
  */

  const type =
    process.argv[2] || 'goal';


  /*
    Change this to:

      home
      away

    when testing goals.
  */

  const team =
    process.argv[3] || 'home';


  if (
    type === 'goal'
  ) {

    if (team === 'away') {

      awayScore++;

    } else {

      homeScore++;

    }

  }


  const event = {

    eventId:
      `demo-${Date.now()}`,

    matchId:
      String(matchId),

    type,

    player:
      'Demo Player',

    minute:
      90,

    team,

    homeScore,

    awayScore,

    timestamp:
      Date.now(),

    demo:
      true

  };


  // ==========================================
  // SAVE JSON
  // ==========================================

  await redis.json.set(
    `event:${event.eventId}`,
    '$',
    event
  );


  // ==========================================
  // SAVE EVENT HISTORY
  // ==========================================

  await redis.lpush(
    `match:${matchId}:events`,
    event
  );


  // ==========================================
  // TIME INDEX
  // ==========================================

  await redis.zadd(
    `match:${matchId}:events_by_time`,
    {
      score: Date.now(),
      member: event.eventId
    }
  );


  // ==========================================
  // STATISTICS
  // ==========================================

  await redis.hincrby(
    `match:${matchId}:stats`,
    `events:${type}`,
    1
  );


  if (
    type === 'goal'
  ) {

    await redis.hincrby(
      `match:${matchId}:stats`,
      `goals:${team}`,
      1
    );


    // Change current score

    await redis.hset(
      `match:${matchId}:state`,
      {
        homeScore,

        awayScore,

        lastUpdate:
          Date.now()
      }
    );

  }


  // ==========================================
  // MARK PROCESSED
  // ==========================================

  await redis.sadd(
    `match:${matchId}:processed`,
    event.eventId
  );


  // ==========================================
  // REDIS PUB/SUB
  // ==========================================

  const subscribers =
    await redis.publish(
      GLOBAL_CHANNEL,
      event
    );


  await redis.publish(
    `match:${matchId}:updates`,
    event
  );


  console.log(
    '\n======================================'
  );

  console.log(
    '🧪 DEMO EVENT PUBLISHED'
  );

  console.log(
    '======================================'
  );

  console.log(
    `Match ID: ${matchId}`
  );

  console.log(
    `Event: ${type}`
  );

  console.log(
    `Team: ${team}`
  );

  console.log(
    `Score: ${homeScore}-${awayScore}`
  );

  console.log(
    `Redis subscribers: ${subscribers}`
  );

  console.log(
    'Redis data updated: YES'
  );

  console.log(
    'Browser update published: YES'
  );

  console.log(
    '======================================'

  );

}


publishTest().catch(
  error => {

    console.error(
      'Demo publish error:',
      error
    );

  }
);