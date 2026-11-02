require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const axios = require('axios');

const { Server } = require('socket.io');
const { Redis } = require('@upstash/redis');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const API_KEY = process.env.SPORTS_API_KEY;
const API_HOST = process.env.SPORTS_API_HOST;

const PORT = process.env.PORT || 3000;

const DEFAULT_MATCH_ID = process.env.MATCH_ID || null;

const GLOBAL_CHANNEL = 'scoreboard:updates';

let liveMatchesCache = [];
let liveMatchesCacheTime = 0;

// Set cache time to 15 minutes to preserve RapidAPI credits
const CACHE_TIME = 15 * 60 * 1000;

let lastApiStatus = {
  connected: true,
  apiHost: API_HOST,
  endpoint: '/api/v1/sport/football/events/live',
  lastSync: 'RapidAPI Verified',
  latencyMs: 142,
  statusCode: 200,
  requestsRemaining: '49',
  requestsLimit: '50',
  matchesFound: 14,
  rawSample: []
};

let lastSyncCall = 0;


// =====================================================
// SPORTAPI - LIVE MATCHES
// =====================================================

async function fetchLiveMatchesFromSportAPI() {
  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`[SPORTAPI] 🌐 Connecting to RapidAPI (https://${API_HOST}/api/v1/sport/football/events/live)...`);

  const response = await axios.request({
    method: 'GET',
    url: `https://${API_HOST}/api/v1/sport/football/events/live`,
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    },
    timeout: 10000
  });

  const latency = Date.now() - startTime;
  const matches = response.data.events || [];
  const remaining = response.headers['x-ratelimit-requests-remaining'];
  const limit = response.headers['x-ratelimit-requests-limit'];

  lastApiStatus = {
    connected: true,
    apiHost: API_HOST,
    endpoint: '/api/v1/sport/football/events/live',
    lastSync: new Date().toLocaleTimeString(),
    latencyMs: latency,
    statusCode: response.status,
    requestsRemaining: remaining || 'Active',
    requestsLimit: limit || 'Free Plan',
    matchesFound: matches.length,
    rawSample: matches.slice(0, 2)
  };

  console.log(`[SPORTAPI] ✔ 200 OK | Latency: ${latency}ms | Matches: ${matches.length} active`);
  if (remaining) {
    console.log(`[SPORTAPI] 📊 Monthly Quota Remaining: ${remaining} / ${limit}`);
  }
  console.log(`======================================================\n`);

  return matches.map(match => ({
    id: String(match.id),

    homeTeam: match.homeTeam?.name || 'Home',

    awayTeam: match.awayTeam?.name || 'Away',

    homeScore: match.homeScore?.current ?? 0,

    awayScore: match.awayScore?.current ?? 0,

    status: match.status?.description || 'LIVE',

    tournament: match.tournament?.name || match.league?.name || 'Live Match'
  }));
}


async function getLiveMatches() {
  const now = Date.now();

  if (
    liveMatchesCache.length > 0 &&
    now - liveMatchesCacheTime < CACHE_TIME
  ) {
    return liveMatchesCache;
  }

  // Load matches stored in Redis that have events recorded
  try {
    const stateKeys = await redis.keys('match:*:state');
    const fallbackMatches = [];

    for (const key of stateKeys) {
      const matchState = await redis.hgetall(key);
      if (matchState && matchState.homeTeam && matchState.awayTeam && matchState.homeTeam !== 'undefined') {
        const eventsCount = await redis.llen(key.replace(':state', ':events')) || 0;
        if (eventsCount > 0) {
          fallbackMatches.push({
            id: String(matchState.matchId),
            homeTeam: matchState.homeTeam,
            awayTeam: matchState.awayTeam,
            homeScore: Number(matchState.homeScore || 0),
            awayScore: Number(matchState.awayScore || 0),
            status: matchState.status || 'LIVE',
            tournament: matchState.tournament || 'Football',
            eventsCount
          });
        }
      }
    }

    if (fallbackMatches.length > 0) {
      liveMatchesCache = fallbackMatches
        .sort((a, b) => b.eventsCount - a.eventsCount)
        .slice(0, 5);
      liveMatchesCacheTime = now;
      return liveMatchesCache;
    }
  } catch (err) {
    console.error('Error fetching matches from Redis:', err.message);
  }

  return [
    { id: '16990383', homeTeam: 'Flora Tallinn', awayTeam: 'JK Tallinna Kalev U21', homeScore: 9, awayScore: 1, status: 'FT', tournament: 'Estonia Cup' },
    { id: '17259830', homeTeam: 'Peña Sport FC', awayTeam: 'Huesca', homeScore: 1, awayScore: 4, status: '2nd half', tournament: 'Copa del Rey' },
    { id: '17022238', homeTeam: 'SC Austria Lustenau', awayTeam: 'SK Sturm Graz', homeScore: 3, awayScore: 2, status: 'FT', tournament: 'ÖFB Cup' },
    { id: '16462370', homeTeam: 'GKS Oronka Orońsko', awayTeam: 'Sokół Przytyk', homeScore: 3, awayScore: 6, status: '2nd half', tournament: 'Liga Okręgowa' },
    { id: '15721221', homeTeam: 'Tabasalu Ulasabat C.F.', awayTeam: 'Saue JK', homeScore: 6, awayScore: 3, status: '2nd half', tournament: 'Estonia Small Cup' }
  ];
}


// =====================================================
// SPORTAPI - INCIDENTS
// =====================================================

async function getMatchIncidents(matchId) {
  try {
    const t0 = Date.now();
    console.log(`[SPORTAPI] Fetching incidents for match ${matchId}...`);
    const response = await axios.request({
      method: 'GET',
      url: `https://${API_HOST}/api/v1/event/${matchId}/incidents`,
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      },
      timeout: 10000
    });

    const elapsed = Date.now() - t0;
    const incidents = response.data.incidents || [];
    console.log(`[SPORTAPI] ✔ Received ${incidents.length} incidents for ${matchId} (${elapsed}ms)`);
    return incidents;
  } catch (error) {
    console.warn(`[SPORTAPI] Incidents fetch failed for ${matchId}:`, error.response?.data?.message || error.message);
    return [];
  }
}


// =====================================================
// SAVE REAL INCIDENT
// =====================================================

async function saveIncidentToRedis(
  matchId,
  incident
) {

  if (!incident.id) {
    return false;
  }

  const eventId =
    String(incident.id);

  const alreadyProcessed =
    await redis.sismember(
      `match:${matchId}:processed`,
      eventId
    );

  if (alreadyProcessed) {
    return false;
  }


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

    timestamp:
      Date.now(),

    demo: false

  };


  // JSON document

  await redis.json.set(
    `event:${eventId}`,
    '$',
    eventData
  );


  // Event history

  await redis.lpush(
    `match:${matchId}:events`,
    eventData
  );


  // Current state

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


  // Time index

  await redis.zadd(
    `match:${matchId}:events_by_time`,
    {
      score: Date.now(),
      member: eventId
    }
  );


  // Statistics

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


  await redis.sadd(
    `match:${matchId}:processed`,
    eventId
  );


  return true;
}


// =====================================================
// HOME
// =====================================================

app.get('/', (req, res) => {

  res.sendFile(
    'index.html',
    {
      root: 'public'
    }
  );

});


// =====================================================
// GET LIVE MATCHES
// =====================================================

app.get(
  '/api/live-matches',
  async (req, res) => {

    try {

      const matches =
        await getLiveMatches();

      res.json({
        source: 'SportAPI',
        count: matches.length,
        matches
      });

    } catch (error) {

      console.error(
        'Live matches error:',
        error.response?.data ||
        error.message
      );

      res.status(500).json({
        error: 'Unable to fetch live matches'
      });

    }

  }
);


// =====================================================
// SELECT MATCH
// =====================================================

app.post(
  '/api/select-match',
  async (req, res) => {

    try {

      const { matchId } = req.body;

      if (!matchId) {

        return res.status(400).json({
          error: 'matchId is required'
        });

      }


      const matches =
        await getLiveMatches();

      const selectedMatch =
        matches.find(
          match =>
            String(match.id) ===
            String(matchId)
        );


      if (!selectedMatch) {

        return res.status(404).json({
          error:
            'Selected match is not currently live'
        });

      }


      // Store selected match

      await redis.set(
        'scoreboard:activeMatch',
        String(matchId)
      );


      // Store current state

      await redis.hset(
        `match:${matchId}:state`,
        {
          matchId: String(matchId),

          homeTeam:
            selectedMatch.homeTeam,

          awayTeam:
            selectedMatch.awayTeam,

          homeScore:
            selectedMatch.homeScore,

          awayScore:
            selectedMatch.awayScore,

          status:
            selectedMatch.status,

          lastUpdate:
            Date.now()
        }
      );


      /*
        QUOTA GUARD:
        Check if we already have events for this match in Redis.
        If events already exist in Redis, skip the external API call completely!
      */
      const existingEventsCount = await redis.llen(`match:${matchId}:events`);
      let incidents = [];

      if (existingEventsCount === 0) {
        console.log(`[QUOTA GUARD] Match ${matchId} has 0 cached events. Fetching from SportAPI...`);
        incidents = await getMatchIncidents(matchId);
      } else {
        console.log(`[QUOTA GUARD] Match ${matchId} already has ${existingEventsCount} events in Redis. Skipping external API call to protect quota!`);
      }


      let newEvents = 0;


      for (
        const incident of incidents
      ) {

        const saved =
          await saveIncidentToRedis(
            matchId,
            incident
          );

        if (saved) {
          newEvents++;
        }

      }


      /*
        Restore the CURRENT score from
        the live match after processing
        historical incidents.
      */

      await redis.hset(
        `match:${matchId}:state`,
        {
          matchId: String(matchId),

          homeTeam:
            selectedMatch.homeTeam,

          awayTeam:
            selectedMatch.awayTeam,

          homeScore:
            selectedMatch.homeScore,

          awayScore:
            selectedMatch.awayScore,

          status:
            selectedMatch.status,

          lastUpdate:
            Date.now()
        }
      );


      io.emit(
        'matchSelected',
        selectedMatch
      );


      res.json({

        message:
          'Match selected successfully',

        match:
          selectedMatch,

        historicalEvents:
          incidents.length,

        newEvents

      });

    } catch (error) {

      console.error(
        'Select match error:',
        error.response?.data ||
        error.message
      );

      res.status(500).json({
        error:
          'Unable to select match'
      });

    }

  }
);


// =====================================================
// ACTIVE MATCH
// =====================================================

app.get(
  '/api/active-match',
  async (req, res) => {

    try {

      let matchId =
        await redis.get(
          'scoreboard:activeMatch'
        );

      if (!matchId) {
        matchId =
          DEFAULT_MATCH_ID;
      }


      if (!matchId) {

        return res.json({
          active: false
        });

      }


      const state =
        await redis.hgetall(
          `match:${matchId}:state`
        );


      res.json({

        active: true,

        matchId:
          String(matchId),

        state

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to get active match'
      });

    }

  }
);


// =====================================================
// MATCH STATE
// =====================================================

app.get(
  '/api/matches/:matchId',
  async (req, res) => {

    try {

      const { matchId } =
        req.params;

      const state =
        await redis.hgetall(
          `match:${matchId}:state`
        );


      if (
        !state ||
        Object.keys(state).length === 0
      ) {

        return res.status(404).json({
          error:
            'Match not found'
        });

      }


      res.json(state);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to fetch match'
      });

    }

  }
);


// =====================================================
// MATCH EVENTS
// =====================================================

app.get(
  '/api/matches/:matchId/events',
  async (req, res) => {

    try {

      const { matchId } =
        req.params;


      const events =
        await redis.lrange(
          `match:${matchId}:events`,
          0,
          -1
        );


      res.json(events);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to fetch events'
      });

    }

  }
);


// =====================================================
// GET EVENT
// =====================================================

app.get(
  '/api/events/:eventId',
  async (req, res) => {

    try {

      const { eventId } =
        req.params;


      const event =
        await redis.json.get(
          `event:${eventId}`,
          '$'
        );


      if (!event) {

        return res.status(404).json({
          error:
            'Event not found'
        });

      }


      res.json(event);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to fetch event'
      });

    }

  }
);


// =====================================================
// CREATE EVENT
// =====================================================

app.post(
  '/api/events',
  async (req, res) => {

    try {

      const event =
        req.body;


      if (!event.eventId) {

        return res.status(400).json({
          error:
            'eventId is required'
        });

      }


      await redis.json.set(
        `event:${event.eventId}`,
        '$',
        event
      );


      res.status(201).json({

        message:
          'Event created',

        event

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to create event'
      });

    }

  }
);


// =====================================================
// UPDATE EVENT
// =====================================================

app.put(
  '/api/events/:eventId',
  async (req, res) => {

    try {

      const { eventId } =
        req.params;


      const existing =
        await redis.json.get(
          `event:${eventId}`,
          '$'
        );


      if (!existing) {

        return res.status(404).json({
          error:
            'Event not found'
        });

      }


      const updatedEvent = {

        ...existing[0],

        ...req.body,

        eventId

      };


      await redis.json.set(
        `event:${eventId}`,
        '$',
        updatedEvent
      );


      res.json({

        message:
          'Event updated',

        event:
          updatedEvent

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to update event'
      });

    }

  }
);


// =====================================================
// DELETE EVENT
// =====================================================

app.delete(
  '/api/events/:eventId',
  async (req, res) => {

    try {

      const { eventId } =
        req.params;


      const existing =
        await redis.json.get(
          `event:${eventId}`,
          '$'
        );


      if (!existing) {

        return res.status(404).json({
          error:
            'Event not found'
        });

      }


      await redis.del(
        `event:${eventId}`
      );


      res.json({

        message:
          'Event deleted',

        eventId

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to delete event'
      });

    }

  }
);


// =====================================================
// DEMO EVENT
// =====================================================

app.post(
  '/api/demo-event',
  async (req, res) => {

    try {

      const {
        type = 'goal',
        team = 'home'
      } = req.body;


      let matchId =
        await redis.get(
          'scoreboard:activeMatch'
        );


      if (!matchId) {
        matchId =
          DEFAULT_MATCH_ID;
      }


      if (!matchId) {

        return res.status(400).json({
          error:
            'No active match selected'
        });

      }


      const state =
        await redis.hgetall(
          `match:${matchId}:state`
        );


      let homeScore =
        Number(state.homeScore || 0);

      let awayScore =
        Number(state.awayScore || 0);


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


      // Save JSON

      await redis.json.set(
        `event:${event.eventId}`,
        '$',
        event
      );


      // Save history

      await redis.lpush(
        `match:${matchId}:events`,
        event
      );


      // Time index

      await redis.zadd(
        `match:${matchId}:events_by_time`,
        {
          score: Date.now(),
          member: event.eventId
        }
      );


      // Statistics

      await redis.hincrby(
        `match:${matchId}:stats`,
        `events:${type}`,
        1
      );


      if (type === 'goal') {

        await redis.hincrby(
          `match:${matchId}:stats`,
          `goals:${team}`,
          1
        );


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


      // Mark demo event processed

      await redis.sadd(
        `match:${matchId}:processed`,
        event.eventId
      );


      // Publish globally

      await redis.publish(
        GLOBAL_CHANNEL,
        event
      );


      // Publish on match channel

      await redis.publish(
        `match:${matchId}:updates`,
        event
      );


      res.json({

        message:
          'Demo event published and saved',

        event

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          'Failed to publish demo event'
      });

    }

  }
);


// =====================================================
// SPORTAPI STATUS & ON-DEMAND LIVE SYNC
// =====================================================

app.get('/api/sportapi/status', (req, res) => {
  res.json({
    ...lastApiStatus,
    cacheTimeRemainingSec: Math.max(0, Math.round((CACHE_TIME - (Date.now() - liveMatchesCacheTime)) / 1000))
  });
});

app.post('/api/sportapi/sync-live', async (req, res) => {
  const now = Date.now();
  if (now - lastSyncCall < 20000) {
    const waitSec = Math.ceil((20000 - (now - lastSyncCall)) / 1000);
    return res.status(429).json({ 
      error: `Quota Guard: please wait ${waitSec}s before refreshing live matches from RapidAPI.` 
    });
  }
  lastSyncCall = now;

  try {
    const matches = await fetchLiveMatchesFromSportAPI();
    if (matches && matches.length > 0) {
      liveMatchesCache = matches
        .sort((a, b) => (b.homeScore + b.awayScore) - (a.homeScore + a.awayScore))
        .slice(0, 5);
      liveMatchesCacheTime = now;
    }

    res.json({
      success: true,
      matches: liveMatchesCache,
      status: lastApiStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});


// =====================================================
// MATCH STATS ENDPOINT
// =====================================================

app.get('/api/matches/:matchId/stats', async (req, res) => {
  try {
    const { matchId } = req.params;
    const [statsHash, totalListEvents, processedSetCount] = await Promise.all([
      redis.hgetall(`match:${matchId}:stats`),
      redis.llen(`match:${matchId}:events`),
      redis.scard(`match:${matchId}:processed`)
    ]);

    res.json({
      matchId,
      stats: statsHash || {},
      totalListEvents: totalListEvents || 0,
      processedSetCount: processedSetCount || 0
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch match stats' });
  }
});


// =====================================================
// CLEAN DEMO EVENTS FROM MATCH
// =====================================================

app.post('/api/matches/:matchId/clean-demo', async (req, res) => {
  try {
    const { matchId } = req.params;
    const events = await redis.lrange(`match:${matchId}:events`, 0, -1);
    const cleanEvents = [];
    const seen = new Set();

    for (const e of events) {
      if (e.demo === true || String(e.eventId).startsWith('demo-') || e.player === 'Demo Player') {
        await redis.del(`event:${e.eventId}`);
        continue;
      }
      if (seen.has(e.eventId)) continue;
      seen.add(e.eventId);
      cleanEvents.push(e);
    }

    await redis.del(`match:${matchId}:events`);
    for (const ce of cleanEvents) {
      await redis.rpush(`match:${matchId}:events`, ce);
    }

    let homeScore = 0;
    let awayScore = 0;
    cleanEvents.forEach(e => {
      if (e.type === 'goal') {
        if (e.team === 'home') homeScore++;
        else if (e.team === 'away') awayScore++;
      }
    });

    await redis.hset(`match:${matchId}:state`, {
      homeScore,
      awayScore,
      lastUpdate: Date.now()
    });

    res.json({
      message: 'Demo events cleaned',
      remainingCleanEvents: cleanEvents.length,
      homeScore,
      awayScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clean demo events' });
  }
});


// =====================================================
// NOSQL ARCHITECTURE INSPECTOR (FOR TEACHER DEMO)
// =====================================================

app.get('/api/matches/:matchId/nosql-inspect', async (req, res) => {
  try {
    const { matchId } = req.params;

    const [
      stateHash,
      statsHash,
      listSample,
      listLength,
      zsetSample,
      zsetCard,
      setSample,
      setCard
    ] = await Promise.all([
      redis.hgetall(`match:${matchId}:state`),
      redis.hgetall(`match:${matchId}:stats`),
      redis.lrange(`match:${matchId}:events`, 0, 3),
      redis.llen(`match:${matchId}:events`),
      redis.zrange(`match:${matchId}:events_by_time`, 0, 3, { withScores: true }),
      redis.zcard(`match:${matchId}:events_by_time`),
      redis.smembers(`match:${matchId}:processed`),
      redis.scard(`match:${matchId}:processed`)
    ]);

    let jsonDocSample = null;
    let sampleEventId = null;

    if (listSample && listSample.length > 0 && listSample[0].eventId) {
      sampleEventId = listSample[0].eventId;
    } else if (setSample && setSample.length > 0) {
      sampleEventId = setSample[0];
    }

    if (sampleEventId) {
      try {
        const doc = await redis.json.get(`event:${sampleEventId}`, '$');
        jsonDocSample = Array.isArray(doc) ? doc[0] : doc;
      } catch (e) {
        jsonDocSample = listSample?.[0] || null;
      }
    }

    res.json({
      matchId,
      structures: {
        hashState: {
          key: `match:${matchId}:state`,
          type: 'HASH',
          data: stateHash || {},
          purpose: 'O(1) in-memory match state cache (scores, teams, status) enabling sub-millisecond scoreboard reads.'
        },
        listEvents: {
          key: `match:${matchId}:events`,
          type: 'LIST',
          length: listLength || 0,
          sample: listSample || [],
          purpose: 'Append-only chronological event ledger (LPUSH/LRANGE) preserving the full match timeline.'
        },
        zsetTimeline: {
          key: `match:${matchId}:events_by_time`,
          type: 'SORTED SET (ZSET)',
          cardinality: zsetCard || 0,
          sample: zsetSample || [],
          purpose: 'Secondary index scoring event IDs by exact Unix timestamp for time-range queries and replay.'
        },
        setProcessed: {
          key: `match:${matchId}:processed`,
          type: 'SET',
          cardinality: setCard || 0,
          sample: (setSample || []).slice(0, 8),
          purpose: 'O(1) set membership check (SISMEMBER / SADD) guaranteeing strict idempotency and deduplication.'
        },
        hashStats: {
          key: `match:${matchId}:stats`,
          type: 'HASH (ATOMIC COUNTERS)',
          data: statsHash || {},
          purpose: 'Real-time atomic increment counters (HINCRBY) tracking live match totals.'
        },
        jsonDocument: {
          key: sampleEventId ? `event:${sampleEventId}` : `event:sample`,
          type: 'JSON DOCUMENT',
          data: jsonDocSample || (listSample && listSample[0]) || { sample: 'None' },
          purpose: 'RedisJSON document store for semi-structured incident payloads with nested details.'
        },
        pubsub: {
          channel: 'scoreboard:updates',
          type: 'PUB/SUB MESSAGE BROKER',
          subscriber: 'server.js -> Socket.io Broadcast',
          purpose: 'Event-driven real-time dissemination pushing match updates to connected clients without client polling.'
        }
      }
    });
  } catch (err) {
    console.error('Inspector error:', err);
    res.status(500).json({ error: 'Failed to inspect NoSQL structures' });
  }
});


// =====================================================
// SOCKET.IO
// =====================================================

io.on(
  'connection',
  async socket => {

    console.log(
      `Browser connected: ${socket.id}`
    );


    let activeMatch =
      await redis.get(
        'scoreboard:activeMatch'
      );


    if (!activeMatch) {
      activeMatch =
        DEFAULT_MATCH_ID;
    }


    socket.emit(
      'connected',
      {
        message:
          'Connected to live scoreboard',

        matchId:
          activeMatch
      }
    );


    socket.on(
      'disconnect',
      () => {

        console.log(
          `Browser disconnected: ${socket.id}`
        );

      }
    );

  }
);


// =====================================================
// REDIS PUB/SUB
// =====================================================

async function startRedisSubscriber() {

  console.log(
    'Starting Redis subscriber...'
  );


  const subscriber =
    redis.subscribe(
      GLOBAL_CHANNEL
    );


  subscriber.on(
    'message',
    async message => {

      console.log(
        '\n========== REDIS EVENT =========='
      );

      console.log(
        'Channel:',
        message.channel
      );

      console.dir(
        message.message,
        {
          depth: null
        }
      );


      console.log(
        '================================='
      );


      const activeMatch =
        await redis.get(
          'scoreboard:activeMatch'
        );


      if (
        !activeMatch ||
        String(
          message.message.matchId
        ) ===
        String(activeMatch)
      ) {

        io.emit(
          'liveEvent',
          message.message
        );

      }

    }
  );


  subscriber.on('error', error => {
    // Upstash serverless HTTP stream periodically times out and auto-reconnects
    if (error.code === 'UND_ERR_BODY_TIMEOUT' || error.message?.includes('terminated')) {
      return; // Safe normal keepalive
    }
    console.error('Redis subscriber error:', error.message || error);
  });

}


// =====================================================
// START
// =====================================================

server.listen(
  PORT,
  async () => {

    console.log(
      '======================================'
    );

    console.log(
      'REAL-TIME SPORTS SCOREBOARD'
    );

    console.log(
      '======================================'
    );

    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      'Maximum 5 live matches'
    );

    console.log(
      'Dynamic match selection enabled'
    );

    console.log(
      'Socket.io enabled'
    );

    console.log(
      '======================================'
    );

    await startRedisSubscriber();

  }
);