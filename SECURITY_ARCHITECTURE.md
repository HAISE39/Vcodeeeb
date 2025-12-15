# 🔒 Security Architecture

## Overview

This document describes the security architecture of the Secure Script Delivery Platform for Game Guardian.

## Security Layers

### 1. Authentication Layer

#### User Authentication
- **Password Hashing**: Bcrypt with 12 rounds
- **Session Management**: JWT tokens via NextAuth.js
- **Token Storage**: HTTP-only cookies
- **Role-Based Access**: ADMIN and USER roles

#### Implementation
```typescript
// lib/auth.ts
- hashPassword(): Bcrypt hashing
- verifyPassword(): Secure comparison
- createUser(): Safe user creation
- authenticateUser(): Login validation
```

### 2. Request Validation Layer

#### Custom Header Validation
Every request to `/api/raw/[id]` must include:

```
X-GG-KEY: <secret-key>
X-CLIENT-TYPE: GG
```

#### Browser Detection
- User-Agent filtering
- Blocks common browser patterns:
  - Mozilla, Chrome, Safari, Edge, Firefox, Opera

#### Implementation
```typescript
// lib/validation.ts
export async function validateGameGuardianRequest() {
  - Check X-GG-KEY header
  - Validate X-CLIENT-TYPE = "GG"
  - Filter browser User-Agents
  - Return true only if all checks pass
}
```

#### Flow Diagram
```
Request → Check Headers → Valid?
                            ├─ Yes → Return Encrypted Script
                            └─ No  → Redirect to Homepage
```

### 3. Encryption Layer

#### Script Encryption
- **Algorithm**: AES-256-CBC
- **Library**: crypto-js
- **Key Storage**: Environment variable
- **Double Storage**: Both plaintext (admin only) and encrypted

#### Implementation
```typescript
// lib/encryption.ts
export function encryptScript(content: string): string {
  return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString()
}

export function decryptScript(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

#### Data Flow
```
Original Script → AES Encrypt → Store in DB → Transmit → Decrypt in GG
```

### 4. Database Security

#### Prisma ORM
- SQL injection prevention
- Parameterized queries
- Type-safe operations

#### Schema Security
```prisma
model User {
  password  String  // Never returned in API responses
  role      UserRole // Access control
}

model Script {
  content   String @db.Text  // Plaintext (admin dashboard only)
  encrypted String @db.Text  // Encrypted (raw endpoint)
  status    ScriptStatus     // Enable/disable scripts
}
```

### 5. Route Protection

#### Middleware
```typescript
// middleware.ts
- Protects /dashboard/* routes
- Redirects unauthenticated users to /login
- Validates JWT tokens
```

#### API Route Protection
```typescript
// All /api/scripts/* routes
const session = await auth()
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 6. Environment Security

#### Required Secrets
```bash
DATABASE_URL=...       # Database credentials
AUTH_SECRET=...        # JWT signing key
GG_SECRET_KEY=...      # Game Guardian validation
ENCRYPTION_KEY=...     # AES encryption key
```

#### Best Practices
- Never commit `.env` files
- Use different keys per environment
- Rotate keys periodically
- Use strong random keys (32+ characters)

## Attack Vectors & Mitigations

### 1. Direct Browser Access
**Attack**: User tries to access `/api/raw/[id]` in browser

**Mitigation**:
- Header validation
- User-Agent filtering
- Automatic redirect
- No script content exposed

### 2. Header Spoofing
**Attack**: Attacker tries to fake headers

**Mitigation**:
- Secret key validation (GG_SECRET_KEY)
- Key stored in environment variables
- Key rotation capability

### 3. Script Interception
**Attack**: Man-in-the-middle intercepts script

**Mitigation**:
- HTTPS enforced (Vercel default)
- End-to-end encryption
- Scripts encrypted at rest and in transit

### 4. Unauthorized Script Modification
**Attack**: Non-admin tries to modify scripts

**Mitigation**:
- JWT authentication required
- Session validation on every request
- Role-based access control

### 5. SQL Injection
**Attack**: Malicious input in API calls

**Mitigation**:
- Prisma ORM with parameterized queries
- Input validation
- Type safety (TypeScript)

### 6. Brute Force Login
**Attack**: Multiple login attempts

**Mitigation**:
- Bcrypt slow hashing (12 rounds)
- Can add rate limiting if needed
- Monitor failed login attempts

## Security Best Practices

### For Administrators

1. **Use Strong Keys**
   ```bash
   # Generate strong keys
   openssl rand -base64 32
   ```

2. **Enable HTTPS**
   - Vercel provides automatic HTTPS
   - Never use HTTP in production

3. **Regular Updates**
   ```bash
   npm audit
   npm update
   ```

4. **Monitor Logs**
   - Check Vercel logs regularly
   - Watch for suspicious patterns
   - Monitor API usage

5. **Backup Database**
   - Regular automated backups
   - Test restore procedures

### For Users

1. **Keep GG_SECRET_KEY Secret**
   - Don't share in public code
   - Don't commit to repositories
   - Change if compromised

2. **Rotate Keys Periodically**
   - Update ENCRYPTION_KEY
   - Update GG_SECRET_KEY
   - Update loader scripts

3. **Monitor Script Access**
   - Check script access patterns
   - Disable unused scripts
   - Remove old versions

## Security Checklist

Before deployment:

- [ ] All environment variables configured
- [ ] Strong random keys generated
- [ ] HTTPS enabled
- [ ] Database credentials secured
- [ ] `.env` not committed to Git
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] Authentication tested
- [ ] Header validation tested
- [ ] Browser blocking tested
- [ ] Encryption/decryption tested

## Incident Response

### If GG_SECRET_KEY is Compromised

1. Generate new key
2. Update environment variable in Vercel
3. Update loader scripts
4. Notify users if necessary

### If ENCRYPTION_KEY is Compromised

1. Generate new key
2. Re-encrypt all scripts
3. Update environment variable
4. Update loader decryption key

### If Database is Breached

1. Change all passwords
2. Rotate all keys
3. Audit access logs
4. Notify affected users
5. Review security measures

## Future Security Enhancements

### Potential Additions

1. **Rate Limiting**
   - Limit requests per IP
   - Prevent abuse

2. **HWID Validation**
   - Device fingerprinting
   - Bind scripts to devices

3. **IP Whitelisting**
   - Restrict access to known IPs
   - Additional validation layer

4. **Time-Based Tokens**
   - Expire after X minutes
   - Reduce replay attacks

5. **Package Name Validation**
   - Verify app package
   - Prevent unauthorized apps

6. **Audit Logging**
   - Log all script accesses
   - Track user actions
   - Security monitoring

7. **2FA for Admins**
   - Two-factor authentication
   - Enhanced account security

## Compliance

### Data Protection
- User passwords hashed (bcrypt)
- No plaintext password storage
- Secure session management

### Access Control
- Role-based permissions
- Protected API endpoints
- Admin-only script viewing

### Encryption
- Scripts encrypted at rest (database)
- Scripts encrypted in transit (HTTPS)
- AES-256-CBC encryption standard

## Security Audit

Regular security audits should check:

1. **Dependencies**: `npm audit`
2. **Environment**: Verify all secrets secured
3. **Access Logs**: Review for anomalies
4. **Database**: Check for unauthorized access
5. **API Endpoints**: Test authentication
6. **Header Validation**: Verify blocking works
7. **Encryption**: Test encrypt/decrypt cycle

---

**Last Updated**: 2024
**Security Level**: Production-Ready
**Maintained By**: Platform Administrators
