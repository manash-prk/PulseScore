// This is a standalone test file. It is NOT part of your real project yet.
// Its only job is to prove: "can my code successfully talk to SportAPI?"
// Once we see this working, we'll move this logic into server.js.

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.SPORTS_API_KEY;
const API_HOST = process.env.SPORTS_API_HOST;

// Step A: get the list of all live football matches right now
async function getLiveMatches() {
  const response = await axios.request({
    method: 'GET',
    url: `https://${API_HOST}/api/v1/sport/football/events/live`,
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    }
  });
  return response.data.events; // this is the array you saw earlier
}

// Step B: get the goal/card history for ONE specific match, by its id
async function getMatchIncidents(matchId) {
  const response = await axios.request({
    method: 'GET',
    url: `https://${API_HOST}/api/v1/event/${matchId}/incidents`,
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    }
  });
  return response.data.incidents; // this is the array you saw earlier
}

async function main() {
  console.log('Fetching live matches...');
  const matches = getLiveMatches ? await getLiveMatches() : [];

  if (!matches.length) {
    console.log('No live matches right now. Try again later.');
    return;
  }

  console.log(`Found ${matches.length} live matches. Here are the first 3:`);
  matches.slice(0, 3).forEach(m => {
    console.log(`- [${m.id}] ${m.homeTeam.name} ${m.homeScore.current} - ${m.awayScore.current} ${m.awayTeam.name} (${m.status.description})`);
  });

  // Pick the first match and look at its goal history
  const firstMatch = matches[0];
  console.log(`\nFetching incidents for match id ${firstMatch.id}...`);
  const incidents = await getMatchIncidents(firstMatch.id);

  const goals = incidents.filter(i => i.incidentType === 'goal');
  console.log(`Found ${goals.length} goals in this match:`);
  goals.forEach(g => {
    console.log(`- ${g.time}' ${g.playerName} (${g.isHome ? 'home' : 'away'} team) -> score becomes ${g.homeScore}-${g.awayScore}`);
  });
}

main().catch(err => console.error('Something went wrong:', err.message));
