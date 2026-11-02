require('dotenv').config();

const { Redis } = require('@upstash/redis');

const io = require('socket.io-client');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const MATCH_ID = process.env.MATCH_ID;

const CHANNEL = `match:${MATCH_ID}:updates`;

async function startSubscriber() {

  console.log('======================================');
  console.log('REDIS PUB/SUB → SOCKET.IO BRIDGE');
  console.log('======================================');
  console.log(`Match ID: ${MATCH_ID}`);
  console.log(`Redis Channel: ${CHANNEL}`);
  console.log('======================================');

  const subscriber = redis.subscribe(CHANNEL);

  subscriber.on('message', (message) => {

    console.log('\n========== NEW LIVE EVENT ==========');

    console.log('Channel:', message.channel);

    console.dir(message.message, {
      depth: null
    });

    console.log('====================================');

  });

  subscriber.on('error', (error) => {

    console.error('Subscriber error:', error);

  });

}

startSubscriber().catch(error => {

  console.error(
    'Failed to start subscriber:',
    error
  );

});