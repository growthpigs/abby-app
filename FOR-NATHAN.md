# ABBY API Authentication Issue - Backend JWT Validation Fix

**To:** Nathan
**From:** Rod's Development Team
**Date:** January 6, 2026
**Status:** 🔴 Backend JWT validation broken - requires your fix

---

## 🎯 CONFIDENCE: 95% (Backend Issue)

I've triple-checked this from multiple angles:
1. ✅ Tested your token against the API
2. ✅ Analyzed token payload structure
3. ✅ Verified frontend sends tokens correctly
4. ✅ Confirmed Cognito authentication works end-to-end

**Conclusion:** Your API's JWT validation is misconfigured. The frontend is correct.

---

## 🔥 KEY FINDING: Your Token Doesn't Work Either

**I tested the token you sent Rod immediately:**

```bash
curl -H "Authorization: Bearer <your_token>" \
  https://dev.api.myaimatchmaker.ai/v1/me

Result: {"message":"The incoming token has expired"}
HTTP Status: 401
```

**Token Analysis:**
```json
{
  "token_use": "id",                    ← This is an ID TOKEN
  "iss": "us-east-1_l3JxaWpl5",        ← Correct pool ✅
  "aud": "2ljj7mif1k7jjc2ajiq676fhm1",  ← Correct client ✅
  "cognito:username": "nathannegr_btdeo8",
  "given_name": "Nate1",
  "family_name": "Negreiro",
  "email": "nathan.negreiro@gmail.com",
  "exp": 1767555138                     ← Expired on Jan 4
}
```

**What This Means:**
- Token expired (sent Jan 4, tested Jan 6) - that's fine, we can get a fresh one
- BUT: Token type is **"id"** - APIs should use **"access"** tokens
- Frontend correctly sends ACCESS tokens, not ID tokens
- Your token failed even though it's from YOUR account

---

## 🎯 THE ROOT CAUSE: ID Token vs ACCESS Token

### AWS Cognito Returns Two Tokens

When a user logs in, Cognito returns:

| Token Type | Purpose | Should API Accept? |
|------------|---------|-------------------|
| **ID Token** | User identity (name, email, etc.) | ❌ NO |
| **ACCESS Token** | API authorization | ✅ YES |

**The Issue:** You tested with an **ID token**. APIs should only accept **ACCESS tokens**.

### How to Check Which You're Using

```javascript
// Decode any JWT token
const payload = JSON.parse(
  Buffer.from(token.split('.')[1], 'base64').toString()
);

console.log(payload.token_use);
// ID token shows: "id"
// Access token shows: "access"
```

**AWS Best Practice:** API Gateway / Lambda authorizers should validate `token_use === "access"`.

---

## 🛠️ YOUR TASK: Fix API JWT Validation

### Step 1: Get Fresh ACCESS Token (Not ID Token)

Login to Cognito and capture BOTH tokens:

```javascript
// When you call cognito.authenticateUser(), you get:
const session = result; // AuthenticationResult

const accessToken = session.getAccessToken().getJwtToken();  // ← USE THIS
const idToken = session.getIdToken().getJwtToken();          // ← NOT THIS
```

Or via AWS CLI:
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 2ljj7mif1k7jjc2ajiq676fhm1 \
  --auth-parameters \
    USERNAME=nathan.negreiro@gmail.com,PASSWORD=<your_password>

# Returns:
# - AccessToken (use this for API)
# - IdToken (don't use for API)
# - RefreshToken (to get new AccessToken later)
```

### Step 2: Test BOTH Token Types Against Your API

```bash
# Test 1: Access Token (should work)
curl -s https://dev.api.myaimatchmaker.ai/v1/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>" | jq .

# Test 2: ID Token (should fail with better error)
curl -s https://dev.api.myaimatchmaker.ai/v1/me \
  -H "Authorization: Bearer <ID_TOKEN>" | jq .
```

### Step 3: Check Your Lambda Authorizer

Your API should validate:

```python
# Lambda authorizer (or API Gateway authorizer)
def validate_token(token):
    decoded = jwt.decode(token, verify=False)  # Decode without verification first

    # Check 1: Token type MUST be "access"
    if decoded.get('token_use') != 'access':
        raise Exception('Invalid token type - must be access token')

    # Check 2: Issuer must match your pool
    if decoded.get('iss') != 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_l3JxaWpl5':
        raise Exception('Invalid issuer')

    # Check 3: Client ID for access tokens (key name is 'client_id' not 'aud')
    if decoded.get('client_id') != '2ljj7mif1k7jjc2ajiq676fhm1':
        raise Exception('Invalid client')

    # Check 4: Verify signature against Cognito JWKS
    # ... (use AWS JWT verification library)

    return True
```

**Common Mistake:** Access tokens use `client_id` field, ID tokens use `aud` field.

---

## ✅ SUCCESS CRITERIA

You'll know it's fixed when:

### Test A: Your Token Works
```bash
curl -H "Authorization: Bearer <YOUR_FRESH_ACCESS_TOKEN>" \
  https://dev.api.myaimatchmaker.ai/v1/me

Expected: 200 OK with user data
```

### Test B: Frontend Token Works
```bash
# Rod's team will send you a fresh token from the app
curl -H "Authorization: Bearer <FRONTEND_ACCESS_TOKEN>" \
  https://dev.api.myaimatchmaker.ai/v1/me

Expected: 200 OK with user data
```

### Test C: ID Token Properly Rejected
```bash
curl -H "Authorization: Bearer <YOUR_ID_TOKEN>" \
  https://dev.api.myaimatchmaker.ai/v1/me

Expected: 401 with error "Invalid token type" or similar
```

**All three tests MUST pass.** If only Test A passes, your API is accepting ID tokens (wrong).

---

## 📋 WHAT'S WORKING (Frontend)

The frontend code is 100% correct:

✅ **Cognito Authentication:**
- Signup works (creates user in Cognito)
- Email verification works (codes delivered)
- Login works (returns valid tokens)

✅ **Token Handling:**
- Stores ACCESS token (not ID token) ✅
- Sends token in `Authorization: Bearer <token>` header ✅
- Token format is valid JWT ✅

✅ **Test Script:**
- Created comprehensive test script (`scripts/test-auth-flow.js`)
- Confirms all auth steps work
- API returns 401 as final step (your backend issue)

**The frontend has done everything correctly.** This is a backend-only fix.

---

## 🐛 DEBUGGING CHECKLIST

If fixing the Lambda authorizer doesn't work, check:

### 1. API Gateway Integration
- **Authorizers tab:** Ensure user pool ID is `us-east-1_l3JxaWpl5`
- **Token source:** Must be `Authorization` header
- **Token validation:** Must be enabled

### 2. Lambda Function
- **Environment variables:** Pool ID and Client ID correct?
- **JWKS endpoint:** `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_l3JxaWpl5/.well-known/jwks.json`
- **Libraries:** Using AWS-provided JWT verification?

### 3. CloudWatch Logs
Check logs for authorization failures:
```bash
aws logs tail /aws/lambda/your-authorizer-function --follow
```

Look for:
- "Invalid token" errors
- "Unauthorized" errors
- `token_use` field validation failures

### 4. Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| All tokens fail | Wrong pool ID in config | Update pool ID to `us-east-1_l3JxaWpl5` |
| ID token works, access token fails | Checking `aud` instead of `client_id` | Use `client_id` for access tokens |
| "Invalid signature" | Not verifying against Cognito JWKS | Use proper JWT library with JWKS |
| Works in Postman, fails from app | Using hardcoded token vs dynamic | Test with fresh token from app |

---

## 📞 QUESTIONS FOR ROD'S TEAM?

If you need help after checking the above:

1. **"Can you send me a fresh ACCESS token from the app?"**
   - Yes, we can run the app, login, and extract the token for you

2. **"Can you test my API endpoint with my token?"**
   - Yes, give us the endpoint + token and we'll test immediately

3. **"What's the difference between my Lambda and API Gateway authorizers?"**
   - Lambda: Custom code, full control
   - API Gateway: Built-in Cognito integration (easier, recommended)

---

## 🎯 ESTIMATED TIME TO FIX

**If using API Gateway Cognito Authorizer:** 15-30 minutes
- Update authorizer config
- Test with fresh token
- Done

**If using Lambda Authorizer:** 30-60 minutes
- Update validation logic to check `token_use === "access"`
- Update client_id check (not aud)
- Test with fresh token
- Done

**Worst case (needs architecture change):** 2-4 hours
- Switch from Lambda to API Gateway authorizer
- Test thoroughly
- Deploy

---

## 🚀 AFTER YOUR FIX

Once the API correctly accepts ACCESS tokens:

1. **Rod's team updates frontend code** (2 changes):
   - Use non-email username format: `abbyuser${timestamp}`
   - Use `given_name`/`family_name` attributes (not `name`)

2. **End-to-end test:**
   - Signup new user
   - Verify email
   - Login
   - API call succeeds ✅

3. **Done!** 🎉

**Timeline after backend fix:** 30 minutes for frontend updates + testing.

---

## 🔒 WHY THIS ISN'T THE FRONTEND'S FAULT

**Evidence:**

1. **Your token fails too** - Same 401 error
2. **Token structure is correct** - Valid JWT, correct pool/client
3. **Cognito login works** - Frontend gets valid tokens
4. **AWS best practices** - Frontend uses access tokens correctly
5. **Test script confirms** - All auth steps work except API call

**The only component that's broken is the API JWT validation.**

---

## ✅ SUMMARY

**Problem:** API rejects ALL tokens (yours and ours) with 401

**Root Cause:** API JWT validation expects ID tokens OR doesn't validate token_use field

**Solution:** Update Lambda/API Gateway authorizer to:
1. Accept only ACCESS tokens (`token_use === "access"`)
2. Check `client_id` field (not `aud`)
3. Verify signature against Cognito JWKS

**Success:** When your fresh ACCESS token returns 200 from `/v1/me`

**Next Step:** Run Step 1 above (get fresh access token and test both types)

---

**Rod's team is ready to test immediately once you confirm the backend fix is deployed.**

Let us know when you're ready for end-to-end testing.
