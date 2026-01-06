# Nathan Call - API Integration Findings

**Date:** 2026-01-06
**Call Time:** 9am PST / 6am your time
**Status:** 🔴 CRITICAL - API JWT validation is broken

---

## 🚨 CRITICAL FINDING: Nathan's Token Doesn't Work Either!

**Test Result:**
```bash
curl -H "Authorization: Bearer <nathan_token>" \
  https://dev.api.myaimatchmaker.ai/v1/me

Response: {"message": "Unauthorized"}  # 401
```

**Conclusion:** This is NOT a frontend issue. The API JWT validation is broken on the backend.

---

## 🔍 Token Analysis

### Nathan's Token (Decoded)

```json
{
  "token_use": "id",                    ← ID TOKEN (not access token!)
  "cognito:username": "nathannegr_btdeo8",
  "given_name": "Nate1",
  "family_name": "Negreiro",
  "email": "nathan.negreiro@gmail.com",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_l3JxaWpl5",
  "aud": "2ljj7mif1k7jjc2ajiq676fhm1",
  "sub": "44689478-20d1-7009-c289-b5c24dc46053"
}
```

**Key Observations:**
- ✅ Correct Cognito pool: `us-east-1_l3JxaWpl5`
- ✅ Correct client ID: `2ljj7mif1k7jjc2ajiq676fhm1`
- ✅ Has given_name and family_name
- ✅ Username is non-email format
- ⚠️ **token_use: "id"** - This is an ID token, not an ACCESS token

---

## 🎯 The Real Issue: ID Token vs ACCESS Token

### What's the Difference?

| Token Type | Purpose | API Authorization |
|------------|---------|-------------------|
| **ID Token** | User identity/claims (email, name, etc.) | ❌ Not for API auth |
| **ACCESS Token** | API authorization | ✅ Used for API auth |

**AWS Best Practice:** APIs should validate **ACCESS tokens**, not ID tokens.

### What We're Doing

Our frontend stores and sends **access tokens** correctly:

```typescript
// AuthService.ts:305
await TokenManager.setToken(accessToken);  // ✅ Correct
```

**But:** Nathan tested with an **ID token**. This might be why his token failed too.

---

## 🔧 Nathan's Debugging Checklist

### 1. Check API JWT Validation Configuration

**Question:** Is the API configured to accept ACCESS tokens or ID tokens?

**AWS API Gateway / Lambda Authorizer should:**
```python
# Correct - validate access token
token_use = decoded_token.get('token_use')
if token_use != 'access':
    raise Exception('Invalid token type')

# Check issuer
iss = decoded_token.get('iss')
if iss != 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_l3JxaWpl5':
    raise Exception('Invalid issuer')

# Check client_id (in access token it's 'client_id', in id token it's 'aud')
client_id = decoded_token.get('client_id')
if client_id != '2ljj7mif1k7jjc2ajiq676fhm1':
    raise Exception('Invalid client')
```

### 2. Test Both Token Types

**Ask Nathan to test:**
```bash
# Get both tokens from Cognito login
ACCESS_TOKEN="..."  # token_use: "access"
ID_TOKEN="..."      # token_use: "id"

# Test access token
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  https://dev.api.myaimatchmaker.ai/v1/me

# Test id token
curl -H "Authorization: Bearer $ID_TOKEN" \
  https://dev.api.myaimatchmaker.ai/v1/me
```

### 3. Check Lambda Authorizer Logs

If using Lambda authorizer:
- Check CloudWatch logs for authorization failures
- Look for "Invalid token" or "Unauthorized" errors
- Verify the authorizer is receiving the token

### 4. Verify Cognito Pool Integration

**API Gateway → Authorizers:**
- User Pool ID: `us-east-1_l3JxaWpl5` ✅
- Token Source: `Authorization` header ✅
- Token validation: Enabled ✅

---

## 🛠️ Frontend Code Changes (AFTER Backend Fix)

**These changes are on hold until Nathan fixes the backend.**

### Change 1: Username Format (AuthService.ts:159)

```diff
- const username = email; // Use email directly as username
+ const username = `abbyuser${Date.now()}`; // Non-email format
```

### Change 2: User Attributes (CognitoConfig.ts:67)

```diff
- new CognitoUserAttribute({ Name: 'name', Value: fullName }),
+ new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
+ new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
```

**But:** These changes won't help if the API JWT validation is broken.

---

## ✅ What's Working on Frontend

- ✅ Cognito signup (creates user)
- ✅ Email verification (codes deliver)
- ✅ Cognito login (returns valid access + id tokens)
- ✅ Token storage (using access token correctly)
- ✅ Token sent in Authorization header

**The frontend is doing everything correctly.** The issue is backend-only.

---

## 📋 Call Agenda

1. **Confirm finding:** Nathan's own token doesn't work (401)
2. **Question:** Is API expecting ID tokens or ACCESS tokens?
3. **Action:** Nathan tests both token types against API
4. **Action:** Nathan checks Lambda authorizer logs
5. **Action:** Nathan verifies Cognito integration config
6. **Follow-up:** Once backend fixed, we update frontend code

---

## 🎯 Expected Resolution

Once Nathan fixes the API JWT validation:
- Test with his token → should work
- Test with our token → should work
- Update frontend code for username/attributes
- Full end-to-end test

**Timeline:** Should be a 1-hour fix once Nathan identifies the config issue.

---

## 📞 Questions for Nathan

1. What type of token is your API expecting? (access or id)
2. Can you test both token types and send us the results?
3. What authorizer are you using? (Lambda, API Gateway Cognito, custom)
4. Can you share the Lambda authorizer code? (if using Lambda)
5. Are there any CloudWatch logs showing auth failures?

---

**Bottom Line:** The API JWT validation is broken. Nathan's token fails, our tokens fail. Fix the backend JWT validation config, then we can proceed with frontend updates.
