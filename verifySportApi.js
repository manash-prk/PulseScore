require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.SPORTS_API_KEY;
const API_HOST = process.env.SPORTS_API_HOST || 'sportapi7.p.rapidapi.com';

async function verify() {
  console.log('\n======================================================');
  console.log('🌐 RAPIDAPI SPORTAPI LIVE HANDSHAKE TEST');
  console.log('======================================================');
  console.log(`Connecting to: https://${API_HOST}/api/v1/sport/football/events/live`);
  console.log(`RapidAPI Key:  ${API_KEY ? API_KEY.slice(0, 10) + '...' + API_KEY.slice(-4) : 'MISSING'}`);
  console.log('Sending single verification request...');

  const t0 = Date.now();
  try {
    const response = await axios.request({
      method: 'GET',
      url: `https://${API_HOST}/api/v1/sport/football/events/live`,
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      },
      timeout: 10000
    });

    const elapsed = Date.now() - t0;
    const matches = response.data.events || [];
    const remaining = response.headers['x-ratelimit-requests-remaining'];
    const limit = response.headers['x-ratelimit-requests-limit'];

    console.log(`\n✔ HTTP STATUS:      ${response.status} ${response.statusText}`);
    console.log(`✔ RESPONSE TIME:    ${elapsed} ms`);
    console.log(`✔ REMAINING QUOTA:  ${remaining || 'N/A'} / ${limit || 'N/A'}`);
    console.log(`✔ LIVE MATCHES NOW: ${matches.length} matches currently active`);
    console.log('------------------------------------------------------');

    if (matches.length > 0) {
      console.log('SAMPLE REAL MATCHES RETRIEVED DIRECTLY FROM RAPIDAPI:');
      matches.slice(0, 3).forEach((m, idx) => {
        console.log(`  ${idx + 1}. [ID: ${m.id}] ${m.homeTeam?.name || 'Home'} ${m.homeScore?.current ?? 0} - ${m.awayScore?.current ?? 0} ${m.awayTeam?.name || 'Away'} (${m.status?.description || 'Live'}) [${m.tournament?.name || 'Tournament'}]`);
      });
    } else {
      console.log('No live matches currently taking place, but connection is 100% verified!');
    }
    console.log('======================================================');
    console.log('✨ Exactly 1 API credit used. No background loops running.\n');
  } catch (err) {
    console.error('\n❌ SPORTAPI ERROR:', err.response?.data?.message || err.message);
    if (err.response) {
      console.error(`Status code: ${err.response.status}`);
      console.error('Headers:', err.response.headers);
    }
    console.log('======================================================\n');
  }
}

verify();
