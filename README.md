# 🔐 Secure Script Delivery Platform

Professional secure script management and delivery system for Game Guardian Lua scripts, similar to luarmor.net.

## ✨ Features

- **🔐 Secure Authentication**: Email/password with bcrypt hashing and JWT sessions
- **📝 Script Management**: Full CRUD operations with admin dashboard
- **🔄 Version Control**: Automatic backup and version history with restore capability
- **☁️ Cloud Storage**: All scripts stored securely in PostgreSQL database
- **🔗 Secure Delivery**: Encrypted scripts with custom header validation
- **🚫 Browser Protection**: Raw endpoints blocked for browsers, only Game Guardian can access
- **🔒 AES Encryption**: Scripts encrypted with AES-256-CBC
- **📊 Dashboard UI**: Modern dark-themed admin panel

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│   Next.js    │─────▶│ PostgreSQL  │
│  (Blocked)  │◀─────│   API Routes │◀─────│  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
                            ▲
                            │
                            │ (Valid Headers)
                            │
                     ┌──────────────┐
                     │     Game     │
                     │   Guardian   │
                     └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GG_SECRET_KEY`: Your custom Game Guardian key
- `ENCRYPTION_KEY`: Generate with `openssl rand -base64 32`

4. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

### Required Environment Variables in Vercel

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
GG_SECRET_KEY=your-gg-key
ENCRYPTION_KEY=your-encryption-key
```

### Database Options for Vercel

- **Vercel Postgres** (Recommended)
- **Neon** (Serverless PostgreSQL)
- **Supabase**
- **Railway**

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Scripts Management (Protected)
- `GET /api/scripts` - List all scripts
- `POST /api/scripts` - Create new script
- `GET /api/scripts/[id]` - Get script details
- `PUT /api/scripts/[id]` - Update script
- `DELETE /api/scripts/[id]` - Delete script
- `POST /api/scripts/[id]/restore` - Restore version

### Secure Raw Endpoint (Game Guardian Only)
- `GET /api/raw/[id]` - Get encrypted script

## 🎮 Game Guardian Loader Example

```lua
-- Secure Script Loader
local function decryptScript(encrypted)
    -- Use your encryption library
    local CryptoJS = require("crypto-js")
    local key = "YOUR_ENCRYPTION_KEY"
    local bytes = CryptoJS.AES.decrypt(encrypted, key)
    return bytes:toString(CryptoJS.enc.Utf8)
end

local function loadScript(scriptId)
    local response = gg.makeRequest({
        url = "https://yourdomain.com/api/raw/" .. scriptId,
        headers = {
            ["X-GG-KEY"] = "YOUR_GG_SECRET_KEY",
            ["X-CLIENT-TYPE"] = "GG"
        }
    })
    
    if response.code == 200 then
        local decrypted = decryptScript(response.content)
        local func, err = load(decrypted)
        if func then
            func()
        else
            gg.alert("Error: " .. err)
        end
    else
        gg.alert("Failed to load: " .. response.code)
    end
end

-- Load your script
loadScript("YOUR_SCRIPT_ID_HERE")
```

## 🔒 Security Features

### 1. Request Validation
- Custom header validation (`X-GG-KEY`, `X-CLIENT-TYPE`)
- User-Agent filtering (blocks browsers)
- Header mismatch → Redirect

### 2. Script Encryption
- AES-256-CBC encryption
- Custom encryption keys
- Encrypted at rest and in transit

### 3. Authentication
- Bcrypt password hashing (12 rounds)
- JWT session tokens
- Protected routes with middleware

### 4. Browser Protection
- Direct access blocked
- Automatic redirects
- No raw script exposure

## 📂 Project Structure

```
/app
  /api
    /auth           # Authentication endpoints
    /scripts        # Script CRUD operations
    /raw/[id]       # Secure raw endpoint
  /dashboard        # Admin panel
    /scripts
      /new          # Create script
      /[id]         # Edit script
  /login            # Login/register page
  /docs             # Documentation
/lib
  /auth.ts          # Authentication utilities
  /encryption.ts    # Encryption functions
  /validation.ts    # Request validation
  /prisma.ts        # Database client
/prisma
  /schema.prisma    # Database schema
/middleware.ts      # Route protection
/auth.config.ts     # NextAuth configuration
```

## 🗄️ Database Schema

```prisma
User
  - id, email, password, name, role, timestamps

Script
  - id, name, description, content, encrypted, status, userId, timestamps
  - Relations: User, ScriptVersion[]

ScriptVersion
  - id, scriptId, content, encrypted, version, createdAt
  - Relations: Script
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Encryption**: crypto-js (AES-256-CBC)
- **Password**: bcrypt
- **Styling**: TailwindCSS
- **Hosting**: Vercel

## 🔄 Workflow

### Admin Workflow
1. Login to dashboard
2. Create/upload Lua script
3. Script automatically encrypted & stored
4. Copy raw endpoint URL
5. Update script anytime (version history saved)

### Game Guardian Workflow
1. Use loader with script ID
2. Loader sends request with valid headers
3. Server validates headers
4. Returns encrypted script
5. Loader decrypts and executes

### Browser Access (Blocked)
1. User opens raw URL in browser
2. Server detects browser User-Agent
3. Missing/invalid headers detected
4. User redirected to homepage
5. Script content protected

## 📝 Development Tips

### Generate Prisma Client
```bash
npx prisma generate
```

### Database Migrations
```bash
npx prisma migrate dev
```

### View Database
```bash
npx prisma studio
```

### Type Checking
```bash
npm run build
```

## 🤝 Contributing

This is a secure script delivery platform. When contributing:
- Follow existing code patterns
- Maintain security best practices
- Test authentication flows
- Verify encryption/decryption

## 📄 License

MIT License - Feel free to use for your projects

## ⚠️ Important Notes

- **Never commit `.env` file**
- **Use strong encryption keys in production**
- **Enable HTTPS in production**
- **Regularly update dependencies**
- **Monitor for suspicious requests**

## 🆘 Support

For issues or questions:
1. Check documentation at `/docs`
2. Review example loader code
3. Verify environment variables
4. Check Vercel logs

---

**Built with ❤️ for secure script delivery**
