// run-test.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function runTest() {
  try {
    // Login to get the token
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo123' })
    });

    const { token } = await loginResponse.json();

    if (!token) {
      console.error('--- LOGIN FAILED ---');
      console.error('Could not retrieve token.');
      return;
    }

    console.log('--- LOGIN SUCCESSFUL ---');
    console.log('Token:', token);

    // Now use the token for tool calls
    const planResponse = await fetch('http://localhost:3000/tools/seam_propose_plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requirements: "Build an online bookstore with user reviews and recommendations",
        aiId: "Gemini",
        domain: "ecommerce"
      })
    });

    const plan = await planResponse.json();
    console.log('--- SERVER RESPONSE ---');
    console.log(JSON.stringify(plan, null, 2));
    console.log('-----------------------');

  } catch (error) {
    console.error('--- TEST FAILED ---');
    console.error(error);
  }
}

runTest();
