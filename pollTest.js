// This builds on testFetch.js. Instead of running once, it keeps checking
// the same match every 15 seconds, and only prints something when a NEW
// incident (goal, card, etc.) shows up that we haven't seen before.

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.SPORTS_API_KEY;
const API_HOST = process.env.SPORTS_API_HOST;

// Change this to any live match id you want to watch.
// You can get one by running testFetch.js again if this match ends.
const MATCH_ID = 16875523;

// This is our "memory" of which incident ids we've already seen.
// It's just a JavaScript Set living in memory - nothing saved to disk yet.
const seenIncidentIds = new Set();

async function getMatchIncidents(matchId) {
  const response = await axios.request({
    method: 'GET',
    url: `https://${API_HOST}/api/v1/event/${matchId}/incidents`,
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    }
  });
  return response.data.incidents;
}

async function checkForNewIncidents() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Checking match ${MATCH_ID}...`);

  const incidents = await getMatchIncidents(MATCH_ID);

  for (const incident of incidents) {
    // Period markers (HT, kickoff, etc.) don't have an "id" field,
    // so we only track incidents that DO have one (goals, cards, subs).
    if (!incident.id) continue;

    if (!seenIncidentIds.has(incident.id)) {
      // This is a brand new incident we haven't printed before!
      seenIncidentIds.add(incident.id);

      const player = incident.playerName || 'Unknown player';
      const side = incident.isHome ? 'home' : 'away';
      console.log(`  NEW EVENT -> ${incident.incidentType.toUpperCase()} | ${incident.time}' | ${player} (${side}) | score now ${incident.homeScore}-${incident.awayScore}`);
    }
  }

  if (incidents.length === 0) {
    console.log('  No incidents yet.');
  }
}

async function start() {
  console.log('Starting poller. Checking every 15 seconds. Press Ctrl+C to stop.');
  // Run once immediately, then repeat every 15 seconds.
  await checkForNewIncidents();
  setInterval(checkForNewIncidents, 15000);
}

start();
