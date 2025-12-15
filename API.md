# 📡 API Documentation

Complete API reference for the Secure Script Delivery Platform.

## Base URL

```
Production: https://your-domain.vercel.app
Development: http://localhost:3000
```

## Authentication

Most endpoints require authentication via NextAuth.js session cookies.

### Headers

```http
Cookie: next-auth.session-token=...
Content-Type: application/json
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User already exists"
}
```

---

### Login

Login is handled by NextAuth.js

**Endpoint:** `POST /api/auth/callback/credentials`

Use the `signIn()` function from next-auth/react in frontend.

---

## Script Management Endpoints

All script endpoints require authentication.

### List Scripts

Get all scripts with metadata.

**Endpoint:** `GET /api/scripts`

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE` or `DISABLED`)

**Success Response (200):**
```json
[
  {
    "id": "clx456...",
    "name": "My Script",
    "description": "Test script",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "_count": {
      "versions": 3
    }
  }
]
```

---

### Get Script

Get details of a specific script including version history.

**Endpoint:** `GET /api/scripts/[id]`

**Success Response (200):**
```json
{
  "id": "clx456...",
  "name": "My Script",
  "description": "Test script",
  "content": "-- Lua script content here",
  "encrypted": "U2FsdGVkX1...",
  "status": "ACTIVE",
  "userId": "clx123...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "versions": [
    {
      "id": "clx789...",
      "version": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "clx790...",
      "version": 2,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Script not found"
}
```

---

### Create Script

Create a new script.

**Endpoint:** `POST /api/scripts`

**Request Body:**
```json
{
  "name": "My New Script",
  "description": "Optional description",
  "content": "-- Lua script content\ngg.alert('Hello World')"
}
```

**Success Response (200):**
```json
{
  "id": "clx456...",
  "name": "My New Script",
  "description": "Optional description",
  "content": "-- Lua script content\ngg.alert('Hello World')",
  "encrypted": "U2FsdGVkX1...",
  "status": "ACTIVE",
  "userId": "clx123...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Name and content are required"
}
```

---

### Update Script

Update an existing script.

**Endpoint:** `PUT /api/scripts/[id]`

**Request Body:**
```json
{
  "name": "Updated Name",           // optional
  "description": "Updated desc",     // optional
  "content": "-- Updated content",   // optional (creates new version)
  "status": "DISABLED"              // optional
}
```

**Success Response (200):**
```json
{
  "id": "clx456...",
  "name": "Updated Name",
  "description": "Updated desc",
  "content": "-- Updated content",
  "encrypted": "U2FsdGVkX1...",
  "status": "DISABLED",
  "userId": "clx123...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

**Notes:**
- If `content` is changed, a new version is automatically created
- Version number is incremented automatically
- Old versions are preserved in `ScriptVersion` table

---

### Delete Script

Delete a script and all its versions.

**Endpoint:** `DELETE /api/scripts/[id]`

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "error": "Failed to delete script"
}
```

---

### Restore Script Version

Restore a previous version of a script.

**Endpoint:** `POST /api/scripts/[id]/restore`

**Request Body:**
```json
{
  "versionId": "clx789..."
}
```

**Success Response (200):**
```json
{
  "id": "clx456...",
  "name": "My Script",
  "content": "-- Restored content",
  "encrypted": "U2FsdGVkX1...",
  "status": "ACTIVE",
  "userId": "clx123...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T02:00:00.000Z"
}
```

**Notes:**
- Restoring creates a new version with the old content
- Original version is preserved

---

## Secure Raw Endpoint

### Get Encrypted Script (Game Guardian Only)

Retrieve encrypted script for execution in Game Guardian.

**Endpoint:** `GET /api/raw/[id]`

**Required Headers:**
```http
X-GG-KEY: your-gg-secret-key
X-CLIENT-TYPE: GG
User-Agent: GameGuardian/Loader (or non-browser UA)
```

**Success Response (200):**
```
Content-Type: text/plain
Cache-Control: no-cache, no-store, must-revalidate

U2FsdGVkX1+zLw8h5F7e... (encrypted script content)
```

**Browser Access (Redirect):**
```
Status: 302 Found
Location: /
```

**Error Response (404):**
```json
{
  "error": "Script not found"
}
```

**Error Response (403):**
```json
{
  "error": "Script is disabled"
}
```

**Notes:**
- Browser requests are automatically redirected to homepage
- Only requests with valid headers receive encrypted content
- Script must have status `ACTIVE`
- User-Agent must not contain browser patterns

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Not logged in |
| 403  | Forbidden - Script disabled or access denied |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production:

- Rate limit per IP
- Rate limit per user
- Rate limit per script

---

## Security Headers

All API responses include security headers:

```http
X-Content-Type-Options: nosniff
Cache-Control: no-cache, no-store, must-revalidate
```

Raw endpoint specifically prevents caching to ensure scripts can be updated.

---

## Example: Complete Workflow

### 1. Register & Login

```bash
# Register
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123"}'

# Login (use frontend or NextAuth signIn)
```

### 2. Create Script

```bash
curl -X POST https://your-app.vercel.app/api/scripts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Test Script",
    "description": "My first script",
    "content": "gg.alert(\"Hello from secure delivery!\")"
  }'
```

### 3. Get Script ID

Response will include script ID: `"id": "clx456..."`

### 4. Load in Game Guardian

```lua
local scriptId = "clx456..."
local response = gg.makeRequest({
    url = "https://your-app.vercel.app/api/raw/" .. scriptId,
    headers = {
        ["X-GG-KEY"] = "your-gg-secret-key",
        ["X-CLIENT-TYPE"] = "GG"
    }
})

if response.code == 200 then
    local decrypted = decryptScript(response.content)
    load(decrypted)()
end
```

---

## Testing with cURL

### Test Browser Blocking

```bash
# Should redirect to homepage
curl -L https://your-app.vercel.app/api/raw/script-id \
  -H "User-Agent: Mozilla/5.0"
```

### Test Valid Request

```bash
# Should return encrypted content
curl https://your-app.vercel.app/api/raw/script-id \
  -H "X-GG-KEY: your-gg-secret-key" \
  -H "X-CLIENT-TYPE: GG" \
  -H "User-Agent: GameGuardian/Loader"
```

---

## Webhooks (Future)

Potential future endpoints:

- `POST /api/webhooks/script-updated` - Notify on script updates
- `POST /api/webhooks/access-log` - Log script accesses

---

## GraphQL (Future)

Consider adding GraphQL API for more flexible queries.

---

**API Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Platform Team
