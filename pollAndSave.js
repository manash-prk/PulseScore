require('dotenv').config();

const axios = require('axios');
const { Redis } = require('@upstash/redis');

const API_KEY = process.env.SPORTS_API_KEY;
const API_HOST = process.env.SPORTS_API_HOST;

const DEFAULT_MATCH_ID = process.env.MATCH_ID || null;

const POLL_INTERVAL =
  Number(process.env.POLL_INTERVAL || 60000);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const GLOBAL_CHANNEL =
  'scoreboard:updates';


// =====================================================
// SPORTAPI
// =====================================================

async function getMatchIncidents(matchId) {

  try {
    const response = await axios.request({

      method: 'GET',

      url:
        `https://${API_HOST}/api/v1/event/${matchId}/incidents`,

      headers: {

        'x-rapidapi-key': API_KEY,

        'x-rapidapi-host': API_HOST

      }

    });

    return response.data.incidents || [];
  } catch (err) {
    console.warn(`Polling: SportAPI incident fetch error for ${matchId}:`, err.response?.data?.message || err.message);
    return [];
  }
}


// =====================================================
// GET ACTIVE MATCH
// =====================================================

async function getActiveMatchId() {

  const activeMatch =
    await redis.get(
      'scoreboard:activeMatch'
    );

  return activeMatch || DEFAULT_MATCH_ID;
}


// =====================================================
// MATCH STATE
// =====================================================

async function saveMatchState(
  matchId,
  incident
) {

  const state = {

    matchId: String(matchId),

    lastUpdate: Date.now()

  };


  if (
    incident.homeScore !== null &&
    incident.homeScore !== undefined
  ) {

    state.homeScore =
      Number(incident.homeScore);

  }


  if (
    incident.awayScore !== null &&
    incident.awayScore !== undefined
  ) {

    state.awayScore =
      Number(incident.awayScore);

  }


  await redis.hset(
    `match:${matchId}:state`,
    state
  );

}


// =====================================================
// SAVE EVENT
// =====================================================

async function saveIncidentToRedis(
  matchId,
  incident
) {

  const eventId =
    String(incident.id);


  const eventData = {

    eventId,

    matchId: String(matchId),

    type:
      incident.incidentType,

    player:
      incident.playerName ||
      incident.player?.name ||
      null,

    minute:
      Number(incident.time) || 0,

    team:
      incident.isHome
        ? 'home'
        : 'away',

    homeScore:
      incident.homeScore ?? null,

    awayScore:
      incident.awayScore ?? null,

    assist:
      incident.assist1?.name ||
      incident.assist1Name ||
      null,

    description:
      incident.description ||
      incident.text ||
      null,

    detail:
      incident.incidentClass ||
      incident.reason ||
      null,

    timestamp:
      Date.now(),

    demo: false

  };


  // ============================================
  // 1. JSON DOCUMENT
  // ============================================

  await redis.json.set(
    `event:${eventId}`,
    '$',
    eventData
  );


  // ============================================
  // 2. EVENT HISTORY
  // ============================================

  await redis.lpush(
    `match:${matchId}:events`,
    eventData
  );


  // ============================================
  // 3. CURRENT STATE
  // ============================================

  await saveMatchState(
    matchId,
    incident
  );


  // ============================================
  // 4. SORTED SET
  // ============================================

  await redis.zadd(
    `match:${matchId}:events_by_time`,
    {
      score: Date.now(),
      member: eventId
    }
  );


  // ============================================
  // 5. STATISTICS
  // ============================================

  await redis.hincrby(
    `match:${matchId}:stats`,
    `events:${incident.incidentType}`,
    1
  );


  if (
    incident.incidentType === 'goal'
  ) {

    const side =
      incident.isHome
        ? 'home'
        : 'away';


    await redis.hincrby(
      `match:${matchId}:stats`,
      `goals:${side}`,
      1
    );

  }


  // ============================================
  // 6. REAL REDIS PUB/SUB
  // ============================================

  await redis.publish(
    `match:${matchId}:updates`,
    eventData
  );


  /*
    Global channel is used by server.js
    to forward the selected match event
    to Socket.io.
  */

  await redis.publish(
    GLOBAL_CHANNEL,
    eventData
  );


  console.log(
    `Saved REAL EVENT: ${eventData.type} | ` +
    `${eventData.minute}' | ` +
    `${eventData.player || 'Unknown'}`
  );

}


// =====================================================
// DUPLICATE PROTECTION
// =====================================================

async function isAlreadyProcessed(
  matchId,
  eventId
) {

  return await redis.sismember(
    `match:${matchId}:processed`,
    String(eventId)
  );

}


async function markAsProcessed(
  matchId,
  eventId
) {

  await redis.sadd(
    `match:${matchId}:processed`,
    String(eventId)
  );

}


// =====================================================
// POLL
// =====================================================

async function checkForNewIncidents() {

  const matchId =
    await getActiveMatchId();


  if (!matchId) {

    console.log(
      '\nNo match selected.'
    );

    return;

  }


  console.log(
    `\n[${new Date().toLocaleTimeString()}] ` +
    `Checking match ${matchId}...`
  );


  try {

    const incidents =
      await getMatchIncidents(
        matchId
      );


    console.log(
      `Received ${incidents.length} incidents`
    );


    for (
      const incident of incidents
    ) {

      if (!incident.id) {
        continue;
      }


      const alreadyProcessed =
        await isAlreadyProcessed(
          matchId,
          incident.id
        );


      if (alreadyProcessed) {
        continue;
      }


      console.log(
        `NEW REAL EVENT → ` +
        `${incident.incidentType.toUpperCase()}`
      );


      await saveIncidentToRedis(
        matchId,
        incident
      );


      await markAsProcessed(
        matchId,
        incident.id
      );

    }

  } catch (error) {

    console.error(
      'Polling error:',
      error.response?.data ||
      error.message
    );

  }

}


// =====================================================
// START
// =====================================================

async function start() {

  console.log(
    '======================================'
  );

  console.log(
    'REAL-TIME SPORTS SCOREBOARD POLLER'
  );

  console.log(
    'SportAPI → Redis → Pub/Sub'
  );

  console.log(
    `Polling every ${POLL_INTERVAL / 1000} seconds`
  );

  console.log(
    'Dynamic match selection enabled'
  );

  console.log(
    '======================================'
  );


  await checkForNewIncidents();


  setInterval(
    checkForNewIncidents,
    POLL_INTERVAL
  );

}


start();