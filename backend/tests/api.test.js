/**
 * tests/api.test.js
 *
 * Quick integration test — run with:
 *   node tests/api.test.js
 *
 * Requires the server to be running on PORT (default 5000).
 * Uses only built-in Node.js http module, no extra test deps.
 *
 * Tests:
 *  ✅ Health check
 *  ✅ Register new user
 *  ✅ Register duplicate (should fail)
 *  ✅ Login with correct credentials
 *  ✅ Login with wrong password (should fail)
 *  ✅ Get /auth/me with valid token
 *  ✅ Get /auth/me without token (should fail)
 *  ✅ Create child profile
 *  ✅ Get child profiles
 *  ✅ Save activity score
 *  ✅ Get scores for child
 *  ✅ Get leaderboard
 *  ✅ Logout
 */

const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 5000}`;
let token  = '';
let userId = '';
let childId = '';

const req = (method, path, body = null, authToken = null) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(payload   ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const r = http.request(`${BASE}${path}`, options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });

const assert = (condition, label) => {
  if (condition) {
    console.log(`  ✅  ${label}`);
  } else {
    console.error(`  ❌  FAILED: ${label}`);
    process.exitCode = 1;
  }
};

(async () => {
  const testEmail    = `test_${Date.now()}@spaceece.dev`;
  const testPassword = 'Test@1234';

  console.log('\n🧪  SpacECE API Tests\n');

  // ── Health check ─────────────────────────────────────────────────────────
  {
    const r = await req('GET', '/api/health');
    assert(r.status === 200 && r.body.status === 'ok', 'GET /api/health → 200 ok');
  }

  // ── Register ──────────────────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/auth/register', {
      email: testEmail, password: testPassword, displayName: 'Test Parent', role: 'parent',
    });
    assert(r.status === 201, 'POST /api/auth/register → 201');
    assert(!!r.body.token, 'Register returns token');
    assert(r.body.user?.email === testEmail, 'Register returns correct email');
    token  = r.body.token;
    userId = r.body.user?.uid;
  }

  // ── Duplicate register ─────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/auth/register', {
      email: testEmail, password: testPassword, role: 'parent',
    });
    assert(r.status === 409, 'Duplicate register → 409 Conflict');
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/auth/login', { email: testEmail, password: testPassword });
    assert(r.status === 200, 'POST /api/auth/login → 200');
    assert(!!r.body.token, 'Login returns token');
    token = r.body.token; // refresh token
  }

  // ── Wrong password ────────────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/auth/login', { email: testEmail, password: 'wrong' });
    assert(r.status === 401, 'Wrong password → 401');
  }

  // ── GET /auth/me with token ────────────────────────────────────────────
  {
    const r = await req('GET', '/api/auth/me', null, token);
    assert(r.status === 200, 'GET /api/auth/me with token → 200');
    assert(r.body.user?.email === testEmail, '/auth/me returns correct user');
  }

  // ── GET /auth/me without token ─────────────────────────────────────────
  {
    const r = await req('GET', '/api/auth/me');
    assert(r.status === 401, 'GET /api/auth/me without token → 401');
  }

  // ── Create child profile ──────────────────────────────────────────────
  {
    const r = await req('POST', '/api/children', {
      name: 'Little Tester', age: 5, avatar: '🧒', parent_uid: userId,
    }, token);
    assert(r.status === 201, 'POST /api/children → 201');
    assert(r.body.data?.name === 'Little Tester', 'Child profile name correct');
    childId = r.body.data?._id;
  }

  // ── Get child profiles ────────────────────────────────────────────────
  {
    const r = await req('GET', `/api/children?parentUid=${userId}`, null, token);
    assert(r.status === 200, 'GET /api/children → 200');
    assert(Array.isArray(r.body.data) && r.body.data.length >= 1, 'Returns array of profiles');
  }

  // ── Save activity score ────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/scores', {
      child_id: childId, activity_type: 'story', score: 90,
      accuracy: 85, time_spent: 120, display_name: 'Little Tester',
    }, token);
    assert(r.status === 201, 'POST /api/scores → 201');
  }

  // ── Get scores for child ───────────────────────────────────────────────
  {
    const r = await req('GET', `/api/scores?childId=${childId}`, null, token);
    assert(r.status === 200, 'GET /api/scores?childId → 200');
    assert(Array.isArray(r.body.data), 'Scores response is array');
  }

  // ── Leaderboard ───────────────────────────────────────────────────────
  {
    const r = await req('GET', '/api/scores/leaderboard', null, token);
    assert(r.status === 200, 'GET /api/scores/leaderboard → 200');
  }

  // ── Logout ────────────────────────────────────────────────────────────
  {
    const r = await req('POST', '/api/auth/logout', null, token);
    assert(r.status === 200, 'POST /api/auth/logout → 200');
  }

  console.log('\n─────────────────────────────────────────');
  if (process.exitCode === 1) {
    console.log('❌  Some tests FAILED. See above.\n');
  } else {
    console.log('✅  All tests passed!\n');
  }
})();
