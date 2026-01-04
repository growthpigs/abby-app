/**
 * Test Auth Flow Script
 *
 * Tests the full Cognito signup → verify → login → API call flow
 * to confirm Nathan's PostConfirmation Lambda fix.
 *
 * Usage: node scripts/test-auth-flow.js
 */

const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} = require('amazon-cognito-identity-js');

// Cognito config (from CognitoConfig.ts)
const poolData = {
  UserPoolId: 'us-east-1_l3JxaWpl5',
  ClientId: '2ljj7mif1k7jjc2ajiq676fhm1',
};

const userPool = new CognitoUserPool(poolData);
const API_BASE = 'https://dev.api.myaimatchmaker.ai';

// Generate unique test credentials
const timestamp = Date.now();
const TEST_EMAIL = `rodericandrews+abbytest${timestamp}@gmail.com`; // Goes to your Gmail
const TEST_USERNAME = `abbytest${timestamp}`; // Non-email username for email-alias pools
const TEST_PASSWORD = 'TestPass123!@#';
const TEST_NAME = 'Chi Test';

console.log('\n=== ABBY Auth Flow Test ===');
console.log(`API: ${API_BASE}`);
console.log(`Test Username: ${TEST_USERNAME}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

// Step 1: Signup
async function signup() {
  console.log('Step 1: Signing up new user...');

  // Try standard Cognito attributes (given_name, family_name)
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: TEST_EMAIL }),
    new CognitoUserAttribute({ Name: 'given_name', Value: 'Chi' }),
    new CognitoUserAttribute({ Name: 'family_name', Value: 'Test' }),
  ];

  return new Promise((resolve, reject) => {
    // Use non-email username since pool is configured for email alias
    userPool.signUp(TEST_USERNAME, TEST_PASSWORD, attributes, [], (err, result) => {
      if (err) {
        console.log('❌ Signup failed:', err.code, '-', err.message);
        reject(err);
        return;
      }

      console.log('✅ Signup successful!');
      console.log('   UserSub:', result.userSub);
      console.log('   Code sent to:', result.codeDeliveryDetails?.Destination);
      resolve(result);
    });
  });
}

// Step 2: Verify (requires manual code entry)
async function verify(code) {
  console.log('\nStep 2: Verifying email with code:', code);

  const cognitoUser = new CognitoUser({
    Username: TEST_USERNAME,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.log('❌ Verification failed:', err.code, '-', err.message);
        reject(err);
        return;
      }

      console.log('✅ Email verified!');
      console.log('   Result:', result);
      resolve(result);
    });
  });
}

// Step 3: Login
async function login() {
  console.log('\nStep 3: Logging in...');

  const cognitoUser = new CognitoUser({
    Username: TEST_USERNAME,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: TEST_USERNAME,
    Password: TEST_PASSWORD,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        console.log('✅ Login successful!');
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        console.log('   Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
        resolve({ accessToken, idToken });
      },
      onFailure: (err) => {
        console.log('❌ Login failed:', err.code, '-', err.message);
        reject(err);
      },
    });
  });
}

// Step 4: Test API - Get user profile
async function testAPI(accessToken) {
  console.log('\nStep 4: Testing API - Getting user profile...');

  try {
    const response = await fetch(`${API_BASE}/v1/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful! User exists in database:');
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed:');
      console.log('   Status:', response.status);
      console.log('   Response:', errorText);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
    return { success: false, error: err.message };
  }
}

// Main flow
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === 'signup') {
    // Just do signup
    await signup();
    console.log('\n📧 Check email for verification code, then run:');
    console.log(`   node scripts/test-auth-flow.js verify <CODE>`);

  } else if (mode === 'verify' && args[1]) {
    // Verify and login
    const code = args[1];
    await verify(code);
    const tokens = await login();
    const result = await testAPI(tokens.accessToken);

    console.log('\n=== RESULT ===');
    if (result.success) {
      console.log('🎉 SUCCESS! PostConfirmation Lambda is working!');
      console.log('   User was created in the database after verification.');
    } else if (result.status === 404) {
      console.log('❌ FAILURE: User NOT found in database');
      console.log('   PostConfirmation Lambda did NOT create the user.');
      console.log('   Nathan needs to check Lambda logs.');
    } else {
      console.log('⚠️  UNKNOWN: Got unexpected response');
      console.log('   Status:', result.status);
    }

  } else if (mode === 'login' && args[1] && args[2]) {
    // Test login with existing user
    const email = args[1];
    const password = args[2];

    // Override test email for existing user test
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    console.log('Testing login for:', email);

    const tokens = await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          console.log('✅ Login successful!');
          resolve({
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
          });
        },
        onFailure: (err) => {
          console.log('❌ Login failed:', err.code, '-', err.message);
          reject(err);
        },
      });
    });

    await testAPI(tokens.accessToken);

  } else {
    console.log('Usage:');
    console.log('  node scripts/test-auth-flow.js signup              # Create new test user');
    console.log('  node scripts/test-auth-flow.js verify <CODE>       # Verify + login + test API');
    console.log('  node scripts/test-auth-flow.js login <email> <pwd> # Test existing user');
  }
}

main().catch(console.error);
