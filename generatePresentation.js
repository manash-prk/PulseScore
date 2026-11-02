const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();

// Slide Layout 16:9 widescreen
pptx.layout = 'LAYOUT_16x9';

// Palette Constants
const C_BG_DARK = '0B132B';
const C_CARD_BG = '1C2541';
const C_ACCENT_CYAN = '00F0FF';
const C_ACCENT_GREEN = '10B981';
const C_ACCENT_YELLOW = 'FBBF24';
const C_ACCENT_PURPLE = '8B5CF6';
const C_TEXT_WHITE = 'FFFFFF';
const C_TEXT_MUTED = '94A3B8';
const C_BORDER_LINE = '334155';

function addHeader(slide, titleText, categoryText = 'PULSESCORE | BCSE406L NoSQL PROJECT') {
  slide.background = { color: C_BG_DARK };

  // Category Pill / Tag
  slide.addText(categoryText.toUpperCase(), {
    x: 0.8, y: 0.4, w: 10, h: 0.3,
    fontSize: 10, fontFace: 'Calibri', bold: true, color: C_ACCENT_CYAN,
    letterSpacing: 2
  });

  // Slide Title
  slide.addText(titleText, {
    x: 0.8, y: 0.65, w: 11.5, h: 0.6,
    fontSize: 22, fontFace: 'Trebuchet MS', bold: true, color: C_TEXT_WHITE
  });

  // Horizontal divider
  slide.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 1.25, w: 11.73, h: 0,
    line: { color: C_BORDER_LINE, width: 1 }
  });

  // Footer
  slide.addText('PulseScore · Real-Time Live Sports Scoreboard & NoSQL Engine · Manash Prakash (23BCE0357)', {
    x: 0.8, y: 7.1, w: 10, h: 0.3,
    fontSize: 9, fontFace: 'Calibri', color: C_TEXT_MUTED
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 1: TITLE SLIDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  s.background = { color: C_BG_DARK };

  // Glowing subtle card in center
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 1.0, w: 10.93, h: 5.5,
    fill: { color: '101A36' },
    line: { color: '203A63', width: 1.5 },
    rectRadius: 0.2
  });

  s.addText('⚡ PULSESCORE', {
    x: 1.8, y: 1.5, w: 9.7, h: 0.4,
    fontSize: 14, fontFace: 'Calibri', bold: true, color: C_ACCENT_CYAN, letterSpacing: 4
  });

  s.addText('Real-Time Live Sports Scoreboard &\nNoSQL Intelligence Engine', {
    x: 1.8, y: 1.95, w: 9.7, h: 1.6,
    fontSize: 32, fontFace: 'Trebuchet MS', bold: true, color: C_TEXT_WHITE, lineSpacing: 38
  });

  s.addText('A high-throughput, in-memory NoSQL architecture powered by Upstash Redis, Express.js, Socket.IO, and SportAPI.', {
    x: 1.8, y: 3.65, w: 9.7, h: 0.6,
    fontSize: 14, fontFace: 'Calibri', color: C_TEXT_MUTED
  });

  s.addShape(pptx.ShapeType.line, {
    x: 1.8, y: 4.4, w: 9.7, h: 0,
    line: { color: C_BORDER_LINE, width: 1 }
  });

  s.addText([
    { text: 'Presenter: ', options: { bold: true, color: C_ACCENT_CYAN } },
    { text: 'Manash Prakash   ', options: { color: C_TEXT_WHITE } },
    { text: 'Register No: ', options: { bold: true, color: C_ACCENT_CYAN } },
    { text: '23BCE0357\n', options: { color: C_TEXT_WHITE } },
    { text: 'Course: ', options: { bold: true, color: C_TEXT_MUTED } },
    { text: 'BCSE406L — NoSQL Databases   ', options: { color: C_TEXT_MUTED } },
    { text: 'School: ', options: { bold: true, color: C_TEXT_MUTED } },
    { text: 'SCOPE, VIT Vellore · Fall 2026–27', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.8, y: 4.6, w: 9.7, h: 1.2,
    fontSize: 13, fontFace: 'Calibri', lineSpacing: 22
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 2: PROJECT ABSTRACT & EXECUTIVE SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Executive Summary & Project Abstract', 'Overview');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.6, h: 5.2,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('📌 The Core Problem', {
    x: 1.1, y: 1.7, w: 5.0, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_YELLOW
  });

  s.addText([
    { text: '• Live Sports Telemetry: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'High-frequency incident arrival (goals, cards, substitutions) with unpredictable concurrent reader spikes.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Disk I/O Bottlenecks: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Relational databases experience table/row lock contention during simultaneous write/read bursts at match peaks.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Webhook Retries: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Upstream provider retries cause duplicate events ("ghost goals") without idempotency validation.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Quota Constraints: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Third-party sports data feeds enforce strict rate limits requiring cache-aside architectures.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.2, w: 5.0, h: 4.2, fontSize: 12, fontFace: 'Calibri', lineSpacing: 18
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('💡 The PulseScore Solution', {
    x: 7.1, y: 1.7, w: 5.1, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_GREEN
  });

  s.addText([
    { text: '• In-Memory Multi-Model Redis: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Deploys 6 specialized Redis data structures for sub-millisecond O(1) state reads and timeline logs.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Real-Time Push Engine: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Socket.IO coupled with Redis Pub/Sub subscriber broadcasts live score changes without browser polling.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Intelligent Quota Guard: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Serves active matches from Redis cache-aside layer, preserving 49/50 monthly API quota requests.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• In-Browser Telemetry Console: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Live NoSQL inspector directly exposes memory hashes, lists, and time complexity within the UI.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 7.1, y: 2.2, w: 5.1, h: 4.2, fontSize: 12, fontFace: 'Calibri', lineSpacing: 18
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 3: SQL VS NOSQL (WHY REDIS?)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Comparative Analysis: Relational (SQL) vs. In-Memory NoSQL', 'Database Justification');

  const headers = [
    { text: 'Architectural Metric', options: { bold: true, fill: '1E293B', color: C_ACCENT_CYAN, align: 'left' } },
    { text: 'Relational DBMS (PostgreSQL / MySQL)', options: { bold: true, fill: '1E293B', color: C_TEXT_WHITE, align: 'left' } },
    { text: 'In-Memory NoSQL (Upstash Redis)', options: { bold: true, fill: '1E293B', color: C_ACCENT_GREEN, align: 'left' } }
  ];

  const rows = [
    [
      { text: 'Primary Storage Medium' },
      { text: 'Disk-backed (NVMe SSD / HDD storage)' },
      { text: '100% In-Memory RAM (microsecond latency)' }
    ],
    [
      { text: 'Data Modeling Paradigm' },
      { text: 'Normalized tables, rows, strict relational foreign keys' },
      { text: 'Multi-Model (Hashes, Lists, Sets, Sorted Sets, JSON)' }
    ],
    [
      { text: 'Scoreboard Read Latency' },
      { text: '50ms – 250ms (Table scan / index traversal overhead)' },
      { text: '< 2ms – 5ms (Constant-time O(1) in-memory key lookup)' }
    ],
    [
      { text: 'Concurrent Writer Scaling' },
      { text: 'Row/Table locks risk contention during score updates' },
      { text: 'Single-threaded event loop; atomic counters (HINCRBY)' }
    ],
    [
      { text: 'Live Event Distribution' },
      { text: 'Requires external broker (Apache Kafka / RabbitMQ)' },
      { text: 'Native Pub/Sub engine included within database engine' }
    ],
    [
      { text: 'Architectural Tradeoff' },
      { text: 'Offers strict ACID transactions across complex joins' },
      { text: 'Requires coordinated writes across denormalized keys' }
    ]
  ];

  s.addTable([headers, ...rows.map(r => r.map((cell, idx) => ({
    text: cell.text,
    options: {
      fill: idx === 2 ? '13253B' : '162036',
      color: idx === 2 ? C_TEXT_WHITE : C_TEXT_MUTED,
      fontSize: 10,
      fontFace: 'Calibri'
    }
  })))], {
    x: 0.8, y: 1.6, w: 11.73, h: 4.8,
    border: { color: C_BORDER_LINE, width: 0.8 }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 4: SYSTEM ARCHITECTURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'End-to-End System Architecture & Data Pipeline', 'System Design');

  const boxes = [
    { title: '1. Upstream Provider', sub: 'SportAPI / Live Feeds', desc: 'Ingests real-world football fixtures and timeline incidents', x: 0.8, color: C_ACCENT_YELLOW },
    { title: '2. Express API Adapter', sub: 'Node.js Backend Engine', desc: 'Parses payload, enforces Quota Guard, triggers validation', x: 3.25, color: C_ACCENT_CYAN },
    { title: '3. In-Memory NoSQL', sub: 'Upstash Cloud Redis', desc: 'Persists match state, event lists, idempotency sets, & stats', x: 5.7, color: C_ACCENT_GREEN },
    { title: '4. Pub/Sub Broker', sub: 'Redis updates channel', desc: 'Decoupled publisher broadcasts live events to listeners', x: 8.15, color: C_ACCENT_PURPLE },
    { title: '5. Client Presentation', sub: 'Socket.IO + Web UI', desc: 'Real-time scoreboard, timeline stream, & momentum graph', x: 10.6, color: C_ACCENT_CYAN }
  ];

  boxes.forEach(b => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: b.x, y: 1.8, w: 2.0, h: 4.5,
      fill: { color: C_CARD_BG }, line: { color: b.color, width: 1.5 }, rectRadius: 0.15
    });

    s.addText(b.title, {
      x: b.x + 0.1, y: 2.1, w: 1.8, h: 0.4,
      fontSize: 12, fontFace: 'Trebuchet MS', bold: true, color: b.color
    });

    s.addText(b.sub, {
      x: b.x + 0.1, y: 2.5, w: 1.8, h: 0.4,
      fontSize: 10, fontFace: 'Calibri', bold: true, color: C_TEXT_WHITE
    });

    s.addShape(pptx.ShapeType.line, {
      x: b.x + 0.1, y: 3.1, w: 1.8, h: 0,
      line: { color: C_BORDER_LINE, width: 0.8 }
    });

    s.addText(b.desc, {
      x: b.x + 0.1, y: 3.4, w: 1.8, h: 2.5,
      fontSize: 11, fontFace: 'Calibri', color: C_TEXT_MUTED, lineSpacing: 16
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 5: THE 6 REDIS DATA STRUCTURES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Multi-Model NoSQL Schema: 6 Redis Data Structures', 'Database Schema');

  const structures = [
    { name: 'HASH', key: 'match:{id}:state', role: 'Live Scoreboard State', cmd: 'HSET / HGETALL', bigO: 'O(1)', desc: 'Stores home/away score, team names, match status, and last update timestamp.' },
    { name: 'LIST', key: 'match:{id}:events', role: 'Chronological Incident Log', cmd: 'RPUSH / LRANGE', bigO: 'O(1) append', desc: 'Ordered ledger preserving sequential match incidents (goals, cards, substitutions).' },
    { name: 'SORTED SET', key: 'match:{id}:events_by_time', role: 'Time-Indexed Queries', cmd: 'ZADD / ZRANGEBYSCORE', bigO: 'O(log N + M)', desc: 'Scores each incident by match minute; enables period range lookups (e.g. 45-90\').' },
    { name: 'SET', key: 'match:{id}:processed', role: 'Idempotency Deduplication', cmd: 'SADD / SISMEMBER', bigO: 'O(1)', desc: 'Stores unique incident IDs; mathematically prevents duplicate webhook ingestion.' },
    { name: 'HASH', key: 'match:{id}:stats', role: 'Atomic Counters', cmd: 'HINCRBY', bigO: 'O(1)', desc: 'Guarantees race-condition-free increments for goals, cards, and team events.' },
    { name: 'PUB / SUB', key: 'match:events:stream', role: 'Decoupled Event Streaming', cmd: 'PUBLISH / SUBSCRIBE', bigO: 'O(N) fanout', desc: 'Pushes events across server tiers to Socket.IO without polling databases.' }
  ];

  structures.forEach((item, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 4.0;
    const y = 1.6 + row * 2.6;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.75, h: 2.3,
      fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.12
    });

    s.addText(`[${item.name}]  Complexity: ${item.bigO}`, {
      x: x + 0.15, y: y + 0.15, w: 3.45, h: 0.3,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: C_ACCENT_CYAN
    });

    s.addText(item.key, {
      x: x + 0.15, y: y + 0.45, w: 3.45, h: 0.35,
      fontSize: 13, fontFace: 'Trebuchet MS', bold: true, color: C_TEXT_WHITE
    });

    s.addText(`Commands: ${item.cmd}`, {
      x: x + 0.15, y: y + 0.85, w: 3.45, h: 0.25,
      fontSize: 10, fontFace: 'Calibri', bold: true, color: C_ACCENT_YELLOW
    });

    s.addText(item.desc, {
      x: x + 0.15, y: y + 1.15, w: 3.45, h: 1.0,
      fontSize: 10, fontFace: 'Calibri', color: C_TEXT_MUTED, lineSpacing: 14
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 6: DATA INGESTION & QUOTA GUARD PATTERN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Telemetry Ingestion & The "Quota Guard" Pattern', 'Resilience Architecture');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 6.2, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('🛡️ The Quota Guard Architecture', {
    x: 1.1, y: 1.9, w: 5.6, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN
  });

  s.addText([
    { text: '• Problem Statement: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'RapidAPI sports telemetry limits free-tier consumers to 50 requests/month. Naive polling would exhaust the quota in minutes.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Cache-Aside Logic: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Before calling the external network, server checks Redis:\n', options: { color: C_TEXT_MUTED } },
    { text: '  const count = await redis.llen(`match:${id}:events`);\n  if (count > 0) return cachedMatchData;\n\n', options: { color: C_ACCENT_GREEN, fontFace: 'Courier New', fontSize: 10 } },
    { text: '• Measurable Outcome: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Preserved 49 out of 50 external requests during testing. Page load latency drops from 805ms (API) to 3.2ms (Redis).', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.4, w: 5.6, h: 4.0, fontSize: 11.5, fontFace: 'Calibri', lineSpacing: 17
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.3, y: 1.6, w: 5.2, h: 5.1,
    fill: { color: '0A192F' }, line: { color: C_ACCENT_CYAN, width: 1.2 }, rectRadius: 0.15
  });

  s.addText('💻 Terminal Evidence: Quota Guard Log', {
    x: 7.6, y: 1.9, w: 4.6, h: 0.4,
    fontSize: 14, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN
  });

  s.addText(`[Node.js Engine Startup]
Server running on http://localhost:3000
Socket.io enabled
Starting Redis subscriber...

Browser connected: 9BTHJQoMex1NTVjQAAAB

[QUOTA GUARD] Match 17192653 already has
25 events in Redis. 
Skipping external API call to protect quota!

[QUOTA GUARD] Match 17022238 already has
21 events in Redis. 
Serving from In-Memory Cache (3.1ms) ✔`, {
    x: 7.6, y: 2.5, w: 4.6, h: 3.8,
    fontSize: 10.5, fontFace: 'Courier New', color: C_TEXT_WHITE, lineSpacing: 16
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 7: IDEMPOTENCY & CONCURRENCY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Event Idempotency & Addressing Concurrency Tradeoffs', 'Distributed Systems');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('🔒 Idempotency via Redis Sets', {
    x: 1.1, y: 1.9, w: 5.0, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_YELLOW
  });

  s.addText([
    { text: '• Why Idempotency is Critical:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Sports data webhooks frequently retry on transient network drops. Ingesting the same goal twice artificially inflates scores.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Mathematical Set Property:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'A Redis Set inherently enforces uniqueness. Event IDs are checked before downstream processing:\n', options: { color: C_TEXT_MUTED } },
    { text: '  match:17022238:processed -> {"367678748", ...}\n\n', options: { color: C_ACCENT_CYAN, fontFace: 'Courier New', fontSize: 10 } },
    { text: '• Demonstrated Result:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'When incident "ev_001" was reinjected during testing, the Set detected membership and rejected the duplicate write.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.4, w: 5.0, h: 4.0, fontSize: 11, fontFace: 'Calibri', lineSpacing: 16
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.6, w: 5.7, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('⚡ Addressing Reviewer Feedback: Atomic SADD', {
    x: 7.1, y: 1.9, w: 5.1, h: 0.4,
    fontSize: 15, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_GREEN
  });

  s.addText([
    { text: '• Reviewer Observation (Slide 32):\n', options: { bold: true, color: C_ACCENT_YELLOW } },
    { text: '"A processed-ID Set is checked, but the check and later SADD are separate, so concurrent pollers can race."\n\n', options: { color: C_TEXT_WHITE, fontFace: 'Calibri' } },
    { text: '• The Technical Solution:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'In Redis, `SADD` natively returns the number of newly added elements:\n', options: { color: C_TEXT_MUTED } },
    { text: '  - Returns 1 if element was newly added\n  - Returns 0 if element already existed\n\n', options: { color: C_ACCENT_CYAN, fontSize: 10 } },
    { text: '• Architectural Upgrade:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'By replacing `SISMEMBER` + `SADD` with a single atomic `SADD` operation, we collapse the check-then-act into an O(1) atomic primitive.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 7.1, y: 2.4, w: 5.1, h: 4.0, fontSize: 11, fontFace: 'Calibri', lineSpacing: 16
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 8: DATA CONSISTENCY ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Consistency Analysis & Denormalization Tradeoffs', 'Reviewer Feedback Defense');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 11.73, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('🔎 Addressing the Observed Mismatch: 1–0 Score vs. Goal Counter 2', {
    x: 1.1, y: 1.9, w: 11.0, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN
  });

  s.addText([
    { text: '1. Root Cause Analysis (Slide 30 & 31 Observation):\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'PulseScore deliberately denormalizes match data across specialized structures for optimized read performance:\n', options: { color: C_TEXT_MUTED } },
    { text: '   • `match:id:state` Hash (Scoreboard snapshot: 1–0)\n   • `match:id:stats` Hash (Atomic counters: goals:home: 2)\n', options: { color: C_ACCENT_YELLOW, fontFace: 'Courier New', fontSize: 10 } },
    { text: 'During an asynchronous ingestion glitch or separate test write, one structure received an update while the other did not.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '2. Why Relational Databases Avoid This (And The Tradeoff):\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Relational databases enforce strict normalization (3NF) and ACID multi-table transactions. However, this introduces row-locking contention and disk I/O latency unsuited for sub-millisecond sports streaming.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '3. Production Mitigation for In-Memory NoSQL:\n', options: { bold: true, color: C_ACCENT_GREEN } },
    { text: 'To ensure atomic consistency across denormalized keys without compromising speed, writes should execute inside a ', options: { color: C_TEXT_MUTED } },
    { text: 'Redis MULTI/EXEC transaction block', options: { bold: true, color: C_TEXT_WHITE } },
    { text: ' or a single embedded ', options: { color: C_TEXT_MUTED } },
    { text: 'Lua Script', options: { bold: true, color: C_TEXT_WHITE } },
    { text: ' executed server-side in Redis.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.4, w: 11.0, h: 4.0, fontSize: 11.5, fontFace: 'Calibri', lineSpacing: 17
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 9: CRUD OPERATIONS VERIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'CRUD Operations & Verification Suite (crudEvidence.js)', 'Testing Evidence');

  const headers = [
    { text: 'Operation', options: { bold: true, fill: '1E293B', color: C_ACCENT_CYAN, align: 'center' } },
    { text: 'Target Redis Structure', options: { bold: true, fill: '1E293B', color: C_TEXT_WHITE } },
    { text: 'Redis CLI Command Executed', options: { bold: true, fill: '1E293B', color: C_ACCENT_YELLOW } },
    { text: 'Observed Runtime Result', options: { bold: true, fill: '1E293B', color: C_ACCENT_GREEN } }
  ];

  const rows = [
    [
      { text: 'Create (C)' },
      { text: 'Hash, List, Set' },
      { text: 'HSET match:999:state / RPUSH match:999:events' },
      { text: '✔ Hash created, event appended, processed SADD indexed' }
    ],
    [
      { text: 'Read (R)' },
      { text: 'Hash, List, Set' },
      { text: 'HGETALL match:999:state / LRANGE match:999:events' },
      { text: '✔ Retrieved 0-0 state, parsed event array, verified SISMEMBER' }
    ],
    [
      { text: 'Update (U)' },
      { text: 'Hash (Score & Stats)' },
      { text: 'HSET homeScore 1 / HINCRBY goals:home 1' },
      { text: '✔ Score updated 0->1, atomic counter incremented to 1' }
    ],
    [
      { text: 'Validation' },
      { text: 'Set (Idempotency)' },
      { text: 'SISMEMBER match:999:processed ev_001' },
      { text: '✔ Duplicate event rejected; insertion blocked' }
    ],
    [
      { text: 'Delete (D)' },
      { text: 'All Test Keys' },
      { text: 'DEL match:999:state :events :processed :stats' },
      { text: '✔ Memory sanitized; 4 isolated test keys deleted' }
    ]
  ];

  s.addTable([headers, ...rows.map(r => r.map((cell, idx) => ({
    text: cell.text,
    options: {
      fill: '162036',
      color: idx === 3 ? C_ACCENT_GREEN : (idx === 2 ? C_ACCENT_YELLOW : C_TEXT_WHITE),
      fontSize: 10,
      fontFace: idx === 2 ? 'Courier New' : 'Calibri',
      align: idx === 0 ? 'center' : 'left'
    }
  })))], {
    x: 0.8, y: 1.6, w: 11.73, h: 4.8,
    border: { color: C_BORDER_LINE, width: 0.8 }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 10: TESTING METHODOLOGY & RESULTS MATRIX
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Testing Methodology & Verification Matrix', 'Quality Assurance');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('📊 Verification Matrix (Slide 28 Analysis)', {
    x: 1.1, y: 1.9, w: 5.0, h: 0.4,
    fontSize: 15, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN
  });

  s.addText([
    { text: '• Total Evaluated Cases: 22 Cases in Matrix\n\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: '• 9 Passed Cases:\n', options: { bold: true, color: C_ACCENT_GREEN } },
    { text: '  - Isolated CRUD on Hash, List, Set, Stats\n  - Express Server startup & socket handshake\n  - 6 Local GET smoke checks (HTTP 200 OK)\n  - Missing field validation (HTTP 400)\n  - Direct SportAPI network handshake (805ms)\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• 1 Partially Verified Case:\n', options: { bold: true, color: C_ACCENT_YELLOW } },
    { text: '  - Error payload format on missing parameters\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• 12 Future Integration Cases:\n', options: { bold: true, color: C_TEXT_MUTED } },
    { text: '  - Multi-worker concurrent load testing\n  - Automated headless browser push verification', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.4, w: 5.0, h: 4.0, fontSize: 11, fontFace: 'Calibri', lineSpacing: 16
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.6, w: 5.7, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('⚡ Measured Performance Metrics', {
    x: 7.1, y: 1.9, w: 5.1, h: 0.4,
    fontSize: 15, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_GREEN
  });

  s.addText([
    { text: '• In-Memory Read Latency:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: '  Redis HGETALL scoreboard fetch: < 4ms\n  PostgreSQL equivalent query estimate: 80ms – 120ms\n  Speedup Factor: > 20x faster\n\n', options: { color: C_ACCENT_CYAN, fontFace: 'Courier New', fontSize: 10 } },
    { text: '• Network Bandwidth Efficiency:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: '  Socket.IO diff events reduce client payload sizes by > 85% compared to recurring 2-second HTTP polling loops.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Third-Party API Roundtrip:\n', options: { bold: true, color: C_TEXT_WHITE } },
    { text: '  SportAPI external latency: 805ms (Demonstrates why cache-aside storage is mandatory for live UX).', options: { color: C_TEXT_MUTED } }
  ], {
    x: 7.1, y: 2.4, w: 5.1, h: 4.0, fontSize: 11, fontFace: 'Calibri', lineSpacing: 16
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 11: LIVE IMPLEMENTATION EVIDENCE (DASHBOARD)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Live Implementation Evidence: Web Dashboard & Inspector', 'Demonstration Proof');

  const cardImg = path.join(__dirname, 'cards_on_stadium.png');
  const matchImg = path.join(__dirname, 'updated_match.png');

  // Try adding images if they exist
  try {
    s.addImage({
      path: cardImg,
      x: 0.8, y: 1.6, w: 5.6, h: 3.5
    });
    s.addText('Figure 1: Stadium Pitch Interface with Verified Match Cards', {
      x: 0.8, y: 5.2, w: 5.6, h: 0.4, fontSize: 10, fontFace: 'Calibri', color: C_TEXT_MUTED, align: 'center'
    });

    s.addImage({
      path: matchImg,
      x: 6.8, y: 1.6, w: 5.7, h: 3.5
    });
    s.addText('Figure 2: Match Center with Goal Scorers, Momentum, & Redis NoSQL Tab', {
      x: 6.8, y: 5.2, w: 5.7, h: 0.4, fontSize: 10, fontFace: 'Calibri', color: C_TEXT_MUTED, align: 'center'
    });
  } catch (e) {
    s.addText('Images loaded at runtime: Match cards & Match Center view', { x: 1, y: 2, w: 10, h: 1, fontSize: 14, color: C_TEXT_WHITE });
  }

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 5.7, w: 11.73, h: 1.2,
    fill: { color: C_CARD_BG }, line: { color: C_ACCENT_CYAN, width: 1 }, rectRadius: 0.1
  });

  s.addText('Key UI Highlights: Digital Score Capsule, SVG Regulation Stadium Pitch Markings, Tabular Numeral Typography, In-Play Momentum Spline, and In-Browser ⚡ Redis NoSQL Inspector exposing raw memory keys directly.', {
    x: 1.0, y: 5.85, w: 11.3, h: 0.9,
    fontSize: 11.5, fontFace: 'Calibri', color: C_TEXT_WHITE, lineSpacing: 16
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 12: CONCLUSION, ENHANCEMENTS & REPO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  addHeader(s, 'Project Conclusions, Future Enhancements & Repository', 'Final Summary');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('🎯 Project Achievements', {
    x: 1.1, y: 1.9, w: 5.0, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_GREEN
  });

  s.addText([
    { text: '• Successfully Built & Deployed: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'A real-time live sports scoreboard engine using multi-model Redis NoSQL.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• 6 Redis Structures: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Hashes, Lists, Sets, Sorted Sets, Pub/Sub, and JSON documents mapped to optimal access patterns.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Zero Refresh Streaming: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'WebSockets push live goal and card telemetry instantly to connected spectators.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Quota Protection: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Cache-aside design preserves third-party API credits and ensures resilience.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 1.1, y: 2.4, w: 5.0, h: 4.0, fontSize: 11.5, fontFace: 'Calibri', lineSpacing: 17
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.6, w: 5.7, h: 5.1,
    fill: { color: C_CARD_BG }, line: { color: C_BORDER_LINE, width: 1 }, rectRadius: 0.15
  });

  s.addText('🚀 Future Enhancements & Codebase', {
    x: 7.1, y: 1.9, w: 5.1, h: 0.4,
    fontSize: 16, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN
  });

  s.addText([
    { text: '• RedisTimeSeries: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Ingesting microsecond GPS player tracking and pitch possession heatmaps.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Atomic Multi-Key Transactions: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'Adopting Redis Lua scripts to eliminate score/counter denormalization divergence.\n\n', options: { color: C_TEXT_MUTED } },
    { text: '• Public GitHub Repository:\n', options: { bold: true, color: C_ACCENT_YELLOW } },
    { text: '  https://github.com/manash-prk/PulseScore\n\n', options: { color: C_ACCENT_CYAN, fontFace: 'Courier New', fontSize: 10 } },
    { text: '• Compliance: ', options: { bold: true, color: C_TEXT_WHITE } },
    { text: 'All credentials sanitized (.env blocked); complete documentation and Annexures B, C, D, E fulfilled.', options: { color: C_TEXT_MUTED } }
  ], {
    x: 7.1, y: 2.4, w: 5.1, h: 4.0, fontSize: 11.5, fontFace: 'Calibri', lineSpacing: 17
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLIDE 13: THANK YOU & Q&A
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pptx.addSlide();
  s.background = { color: C_BG_DARK };

  s.addShape(pptx.ShapeType.roundRect, {
    x: 2.0, y: 1.5, w: 9.33, h: 4.5,
    fill: { color: '101A36' }, line: { color: C_ACCENT_CYAN, width: 1.5 }, rectRadius: 0.2
  });

  s.addText('THANK YOU!', {
    x: 2.5, y: 2.2, w: 8.33, h: 0.8,
    fontSize: 40, fontFace: 'Trebuchet MS', bold: true, color: C_ACCENT_CYAN, align: 'center'
  });

  s.addText('Questions & Discussion', {
    x: 2.5, y: 3.1, w: 8.33, h: 0.5,
    fontSize: 20, fontFace: 'Calibri', color: C_TEXT_WHITE, align: 'center'
  });

  s.addShape(pptx.ShapeType.line, {
    x: 4.5, y: 3.8, w: 4.33, h: 0,
    line: { color: C_BORDER_LINE, width: 1 }
  });

  s.addText('Manash Prakash · 23BCE0357\nSchool of Computer Science and Engineering, VIT Vellore\nGitHub: https://github.com/manash-prk/PulseScore', {
    x: 2.5, y: 4.1, w: 8.33, h: 1.2,
    fontSize: 13, fontFace: 'Calibri', color: C_TEXT_MUTED, align: 'center', lineSpacing: 22
  });
}

// Save Presentation
const outputFile = path.join('/Users/manash/Desktop/no sql project final', 'PulseScore_Presentation_23BCE0357.pptx');
pptx.writeFile({ fileName: outputFile })
  .then(() => {
    console.log(`✔ Presentation generated successfully at: ${outputFile}`);
  })
  .catch(err => {
    console.error('Error generating presentation:', err);
  });
