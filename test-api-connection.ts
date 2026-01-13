/**
 * API Connection Test
 *
 * Run with: npx ts-node test-api-connection.ts
 *
 * This proves the app CAN connect to their backend API.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const API_BASE = 'https://dev.api.myaimatchmaker.ai';

// Cognito config (from their backend)
const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
};

const userPool = new CognitoUserPool(poolData);

async function getToken(username: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        resolve(idToken);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

async function testEndpoint(name: string, url: string, token: string, method = 'GET', body?: object) {
  console.log(`\n=== Testing: ${name} ===`);
  console.log(`${method} ${url}`);

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const status = response.status;

    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    console.log(`Status: ${status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2).substring(0, 500));

    return { status, data };
  } catch (error) {
    console.log(`Error:`, error);
    return { status: 0, error };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        ABBY API CONNECTION TEST                       ║');
  console.log('║        Proving backend connectivity                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  // You need to provide valid credentials
  const USERNAME = process.argv[2];
  const PASSWORD = process.argv[3];

  if (!USERNAME || !PASSWORD) {
    console.log('\nUsage: npx ts-node test-api-connection.ts <username> <password>');
    console.log('\nTo get credentials, sign up in the app first.');
    process.exit(1);
  }

  console.log('\n1. Authenticating with Cognito...');

  let token: string;
  try {
    token = await getToken(USERNAME, PASSWORD);
    console.log('✅ Got token from Cognito!');
    console.log(`Token (first 50 chars): ${token.substring(0, 50)}...`);
  } catch (error) {
    console.log('❌ Cognito auth failed:', error);
    process.exit(1);
  }

  console.log('\n2. Testing API endpoints with real token...\n');

  // Test endpoints
  await testEndpoint('Get Profile', `${API_BASE}/v1/me`, token);
  await testEndpoint('Get Questions Next', `${API_BASE}/v1/questions/next`, token);
  await testEndpoint('Get Match Candidates', `${API_BASE}/v1/matches/candidates`, token);
  await testEndpoint('Get Photos', `${API_BASE}/v1/photos`, token);
  await testEndpoint('Check Voice Available', `${API_BASE}/v1/abby/realtime/available`, token);

  // Test profile creation
  console.log('\n3. Testing Profile Creation...');
  await testEndpoint(
    'Create/Update Profile',
    `${API_BASE}/v1/profile/public`,
    token,
    'PUT',
    {
      full_name: 'Test User',
      display_name: 'Tester',
      gender: 'man',
      date_of_birth: '1990-01-15',
      seeking_genders: ['woman'],
    }
  );

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Test complete. Check responses above for API connectivity.');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
