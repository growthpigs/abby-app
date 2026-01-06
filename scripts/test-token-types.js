/**
 * Test Token Types - ID vs ACCESS tokens
 *
 * Nathan sent an ID token. Let's see if API needs ACCESS token instead.
 */

const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} = require('amazon-cognito-identity-js');

const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
};

const userPool = new CognitoUserPool(poolData);
const API_BASE = 'https://dev.api.myaimatchmaker.ai';

// Use Nathan's credentials as reference
const TEST_USERNAME = 'nathannegr_btdeo8';
const TEST_EMAIL = 'nathan.negreiro@gmail.com';
const TEST_PASSWORD = process.argv[2]; // Pass password as argument

async function testTokenTypes() {
  console.log('\n=== Token Types Test ===');
  console.log(`Username: ${TEST_USERNAME}`);
  console.log(`Email: ${TEST_EMAIL}\n`);

  // Login to get both tokens
  const cognitoUser = new CognitoUser({
    Username: TEST_EMAIL, // Try email for login
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: TEST_EMAIL,
    Password: TEST_PASSWORD,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (session) => {
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();

        console.log('✅ Login successful!\n');

        // Decode both tokens
        const decodeToken = (token) => {
          const payload = token.split('.')[1];
          return JSON.parse(Buffer.from(payload, 'base64').toString());
        };

        const accessPayload = decodeToken(accessToken);
        const idPayload = decodeToken(idToken);

        console.log('=== ACCESS TOKEN ===');
        console.log('token_use:', accessPayload.token_use);
        console.log('sub:', accessPayload.sub);
        console.log('username:', accessPayload.username);
        console.log('First 50 chars:', accessToken.substring(0, 50) + '...\n');

        console.log('=== ID TOKEN ===');
        console.log('token_use:', idPayload.token_use);
        console.log('sub:', idPayload.sub);
        console.log('cognito:username:', idPayload['cognito:username']);
        console.log('email:', idPayload.email);
        console.log('First 50 chars:', idToken.substring(0, 50) + '...\n');

        // Test both against API
        console.log('=== Testing ACCESS token against /v1/me ===');
        const accessResponse = await fetch(`${API_BASE}/v1/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Status:', accessResponse.status);
        const accessData = await accessResponse.text();
        console.log('Response:', accessData, '\n');

        console.log('=== Testing ID token against /v1/me ===');
        const idResponse = await fetch(`${API_BASE}/v1/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Status:', idResponse.status);
        const idData = await idResponse.text();
        console.log('Response:', idData);

        resolve({ accessToken, idToken, accessPayload, idPayload });
      },
      onFailure: (err) => {
        console.log('❌ Login failed:', err.message);
        reject(err);
      },
    });
  });
}

if (!TEST_PASSWORD) {
  console.log('Usage: node test-token-types.js <password>');
  process.exit(1);
}

testTokenTypes().catch(console.error);
