# Secure Script Delivery System for GameGuardian (Lua)

Platform manajemen dan pengiriman script Lua aman yang dirancang khusus untuk GameGuardian. Sistem ini mencegah akses browser langsung dan mengenkripsi payload script sehingga hanya loader yang valid yang dapat mendekripsinya.

## 🏗 Arsitektur Sistem

- **Backend**: Node.js dengan Express.js
- **Database**: SQLite (via Sequelize ORM) - *Bisa diganti ke PostgreSQL/MySQL dengan mudah*
- **Frontend**: EJS Templates + Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens) disimpan dalam Cookies
- **Encryption**: Custom XOR + Base64 Encoding
- **Security**: 
  - Header Validation (X-GG-KEY)
  - Browser Redirection
  - User-Agent Checks

## 📂 Struktur Folder Project

```
/home/engine/project
├── src
│   ├── config          # Konfigurasi Database
│   ├── middleware      # Auth & Security Middleware
│   ├── models          # Definisi Schema Database (User, Script, Version)
│   ├── routes          # Route Handler (Auth, Dashboard, Raw Endpoint)
│   ├── utils           # Helper Encryption & Loader Generator
│   ├── views           # Frontend Templates (EJS)
│   └── server.js       # Entry Point
├── public              # Static Files
├── database.sqlite     # File Database
└── package.json
```

## 🔄 Flow Request

### 1. Akses Browser (Unauthorized)
1. User membuka `https://domain.com/raw/{uuid}` di browser.
2. Server memeriksa header `X-GG-KEY`.
3. Header **TIDAK** ditemukan.
4. Server me-redirect user ke `https://google.com` (atau halaman error palsu).
5. **Hasil**: Script raw tidak pernah tampil.

### 2. Akses GameGuardian (Authorized)
1. Script Loader GG mengirim request `gg.makeRequest` ke `https://domain.com/raw/{uuid}`.
2. Request menyertakan header `X-GG-KEY: {SECRET_KEY}`.
3. Server memvalidasi key dengan database.
4. Server mengambil konten script terbaru.
5. Server melakukan enkripsi: `Base64(XOR(Script, Key))`.
6. Server mengirim response `text/plain` terenkripsi.
7. Loader GG menerima response, mendekripsi, dan menjalankan `load()`.

## 💻 Contoh Kode Backend Endpoint Raw

File: `src/routes/raw.js`

```javascript
router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const script = await Script.findOne({ where: { uuid } });

    // 1. Redirect Browser / Unauthorized Access
    if (!script || req.headers['x-gg-key'] !== script.secretKey) {
        return res.redirect('https://google.com'); 
    }

    // 2. Ambil & Enkripsi Script
    const content = await getLatestVersion(script.id);
    const encrypted = encryptScript(content, script.secretKey);

    // 3. Kirim
    res.setHeader('Content-Type', 'text/plain');
    res.send(encrypted);
});
```

## 🗄 Contoh Database Schema

Menggunakan Sequelize Models (`src/models/`):

**User**:
- `id`: PK
- `email`: String
- `password`: String (Hashed)
- `role`: Admin/User

**Script**:
- `id`: PK
- `uuid`: UUID (Public ID untuk URL)
- `secretKey`: String (Secret Key untuk Header)
- `name`: String
- `isActive`: Boolean

**ScriptVersion**:
- `id`: PK
- `scriptId`: FK -> Script
- `content`: Text (Isi Script)
- `version`: Integer

## 🎮 Contoh Loader Game Guardian

Loader ini digenerate otomatis di Dashboard untuk setiap script.

```lua
local url = "https://domain.com/raw/UUID_SCRIPT"
local secret = "SECRET_KEY_SCRIPT"

function decrypt(data, key)
    -- Fungsi decrypt custom (Base64 Decode + XOR)
    -- ... (Lihat implementasi lengkap di src/utils/loaderGenerator.js)
end

local r = gg.makeRequest({
  url = url,
  headers = {
    ["X-GG-KEY"] = secret,
    ["User-Agent"] = "GameGuardian"
  }
})

if r.code == 200 then
    local decoded = decrypt(r.content, secret)
    load(decoded)()
else
    gg.alert("Failed to load script")
end
```

## 🔒 Security Layer Details

1.  **Anti-Direct Access**: Endpoint `/raw` memeriksa keberadaan header kustom. Browser standard tidak mengirim header ini, sehingga otomatis ditolak.
2.  **Payload Encryption**: Bahkan jika seseorang berhasil mencegat packet (Man-in-the-Middle), mereka hanya mendapatkan string acak. Tanpa algoritma dekripsi dan Key yang tepat, script tidak terbaca.
3.  **Authentication**: Dashboard admin dilindungi JWT dan Password Hashing (Bcrypt).
4.  **Version Control**: Setiap kali script diedit, versi lama tersimpan. Jika terjadi kesalahan update, admin masih memiliki backup.

## 🚀 Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan server:
   ```bash
   node src/server.js
   ```
3. Buka Dashboard: `http://localhost:3000`
4. Register akun pertama (akan otomatis menjadi Admin).

## ☁️ Deployment ke Vercel

Project ini sudah dikonfigurasi untuk siap deploy ke Vercel.

### Persyaratan
Karena Vercel menggunakan arsitektur serverless (read-only filesystem), Anda **WAJIB** menggunakan database eksternal (PostgreSQL) dan tidak bisa menggunakan SQLite bawaan.

1. Buat project baru di Vercel.
2. Siapkan database PostgreSQL (bisa pakai **Vercel Postgres**, **Neon**, atau **Supabase**).
3. Di Settings > Environment Variables project Vercel Anda, tambahkan:
   - `DATABASE_URL`: Connection string PostgreSQL Anda (contoh: `postgres://user:pass@host:5432/dbname`)
   - `JWT_SECRET`: String acak untuk keamanan session.
4. Deploy project.

Jika variable `DATABASE_URL` terdeteksi, aplikasi akan otomatis beralih dari SQLite ke PostgreSQL.

