# Football API — Individual Project Phase 2 (Server Side)

> API Documentation untuk server aplikasi **Football Hub**
> (folder: `start/server` — Express 5 + Sequelize + PostgreSQL)

Football API adalah REST API untuk aplikasi Football Hub: autentikasi user
(register/login manual, Google, dan Facebook), manajemen data klub sepak bola
(CRUD), serta chatbot AI (Gemini) yang hanya menjawab pertanyaan seputar sepak
bola Indonesia.

Seluruh response dikirim dalam format **JSON**.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Cara Menjalankan](#cara-menjalankan)
- [Environment Variables](#environment-variables)
- [Base URL & Format Data](#base-url--format-data)
- [Autentikasi (JWT)](#autentikasi-jwt)
- [Global Responses](#global-responses)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [Detail Endpoint](#detail-endpoint)
  - [GET /genAI](#1-get-genai)
  - [POST /register](#2-post-register)
  - [POST /login](#3-post-login)
  - [POST /google-login](#4-post-google-login)
  - [POST /facebook-login](#5-post-facebook-login)
  - [GET /](#6-get-)
  - [POST /](#7-post-)
  - [GET /:id](#8-get-id)
  - [PUT /:id](#9-put-id)
  - [DELETE /:id](#10-delete-id)
- [Struktur Database](#struktur-database)
- [Menjalankan Test](#menjalankan-test)
- [Catatan & Perilaku yang Perlu Diketahui](#catatan--perilaku-yang-perlu-diketahui)

## Tech Stack

- Node.js + Express 5 (`express`)
- PostgreSQL + Sequelize 6 (`sequelize`, `pg`, `sequelize-cli`)
- JSON Web Token (`jsonwebtoken`) & `bcryptjs`
- Google OAuth (`google-auth-library`) & Facebook Graph API (`axios`)
- Google Gemini AI (`@google/genai`)
- Jest + Supertest (testing)

## Cara Menjalankan

```bash
cd start/server
npm install

# 1. Siapkan database PostgreSQL (default ada di config/config.json):
#    development -> Football_Api | test -> Football_Api_test
npx sequelize-cli db:create

# 2. Buat file .env (contoh daftar variabel ada di env-template.txt)
cp env-template.txt .env

# 3. Jalankan migrasi
npx sequelize-cli db:migrate

# 4. Jalankan server (default port 3000)
node bin/www.js
# atau dengan port lain:
PORT=4000 node bin/www.js
```

## Environment Variables

| Variable | Wajib | Fungsi |
| --- | --- | --- |
| `SECRET_KEY` | Ya | Secret key untuk `jwt.sign` / `jwt.verify`. |
| `GOOGLE_CLIENT_ID` | Ya* | Audience saat verifikasi Google ID token (`POST /google-login`). |
| `GEMINI_API_KEY` | Ya* | API key Gemini untuk `GET /genAI`. |
| `GEMINI_MODEL` | Tidak | Model Gemini; default `gemini-3.8-flash`. |
| `FACEBOOK_APP_SECRET` | Tidak | Dipakai untuk `appsecret_proof` jika Facebook mewajibkannya di pengaturan aplikasi. |
| `DATABASE_URL` | Ya (production) | Koneksi database saat `NODE_ENV=production`. |
| `PORT` | Tidak | Port server, default `3000`. |
| `NODE_ENV` | Tidak | `development` (default) / `test` / `production`. |

\* Di source code saat ini ada nilai fallback yang di-hardcode. Untuk keamanan,
selalu isi nilainya dari `.env` dan jangan commit file `.env`.

Saat `NODE_ENV !== "production"`, server otomatis membaca file `.env`
lewat `dotenv`.

Buat `GEMINI_API_KEY` dari Google AI Studio dan atur hanya di environment
server (`start/server/.env` saat lokal atau secret/environment variables di
platform deploy). Jangan gunakan key frontend/Maps, jangan commit key, dan
restart server setelah menggantinya. Jika API mengembalikan 401, key tidak
valid atau tidak diizinkan untuk Gemini API; periksa juga kuota dan akses
model pada project Google Cloud yang terkait.

### Facebook Login

- Client: isi `VITE_FACEBOOK_APP_ID` di `start/client/.env` dengan App ID dari
  Meta for Developers. Jangan masukkan App Secret ke client.
- Server: isi `FACEBOOK_APP_SECRET` di `start/server/.env` hanya jika opsi
  "Require App Secret" di pengaturan Facebook Login diaktifkan.
- Di Meta for Developers, aktifkan Facebook Login dan JavaScript SDK, lalu
  izinkan domain aplikasi (untuk local dev gunakan `localhost`). Development
  server Vite menggunakan HTTPS lokal; buka origin tersebut dan setujui
  sertifikat development browser.
- Saat aplikasi Facebook masih dalam mode Development, gunakan akun yang sudah
  ditambahkan sebagai admin, developer, tester, atau test user. Untuk pengguna
  umum, aplikasi harus dipindahkan ke Live setelah memenuhi persyaratan Meta.
- Pastikan izin `email` tersedia untuk aplikasi. Login memerlukan alamat email
  yang dikembalikan Facebook agar dapat mencocokkan akun.
- Untuk production, daftarkan domain HTTPS yang sama di pengaturan aplikasi
  Facebook dan set env client/server pada platform deploy.

## Base URL & Format Data

| Environment | Base URL |
| --- | --- |
| Development | `http://localhost:3000` |
| Production (dipakai client) | `https://football.nickz.online` |

- Format data: **JSON** (`Content-Type: application/json`).
- Client React (`start/client`) memakai base URL ini dari `src/api/auth.js`
  dan bisa dioverride lewat environment variable `VITE_API_URL`.
- Pada development client lokal, request chatbot `/genAI` diproxy oleh Vite ke
  `http://localhost:3000` agar halaman HTTPS tidak memanggil API HTTP secara
  langsung.
- CORS diaktifkan untuk semua origin (`app.use(cors())`).

## Autentikasi (JWT)

Endpoint bertanda **Auth: Ya** wajib mengirim access token pada header:

```
Authorization: Bearer <access_token>
```

Cara mendapatkan `access_token`:

1. `POST /register` (daftar user baru), lalu `POST /login`; **atau**
2. `POST /google-login` dengan Google ID token; **atau**
3. `POST /facebook-login` dengan Facebook access token.

Token dibuat dengan `jwt.sign({ id, email }, SECRET_KEY)` — **tanpa** masa
kedaluwarsa (`expiresIn`), jadi token berlaku sampai `SECRET_KEY` diganti.

Middleware `authentication` (`middlewares/authentication.js`) akan:

1. Mengambil header `authorization`, lalu memakai bagian setelah spasi pertama
   sebagai token (`authorization.split(" ")[1]`).
2. Memverifikasi token dan mencari user dengan `id` dari payload.
3. Menyimpan data login ke `req.loginInfo = { userId, email, role }`.

Jika header tidak ada, token invalid, atau user sudah tidak ada di database,
server membalas **401** `{ "message": "Please login first" }`.

## Global Responses

Response berikut berlaku untuk semua endpoint (dihasilkan oleh
`middlewares/errorHandler.js`):

| Status | Nama Error / Kondisi | Body Response |
| --- | --- | --- |
| 400 | `SequelizeValidationError`, `SequelizeUniqueConstraintError` | `{ "message": "<pesan validasi model>" }` |
| 400 | `SequelizeDatabaseError`, `SequelizeForeignKeyConstraintError` | `{ "message": "Invalid input" }` |
| 400 | `InvalidInput` | `{ "message": "Input is required" }` |
| 401 | `InvalidLogin` | `{ "message": "Please input email or password" }` |
| 401 | `LoginError` | `{ "message": "Invalid email or password" }` |
| 401 | `Unauthorized`, `JsonWebTokenError` | `{ "message": "Please login first" }` |
| 403 | `Forbidden` | `{ "message": "You don't have any access" }` |
| 404 | `NotFound` | `{ "message": "Data not found" }` |
| 500 | Error lain (mis. `TypeError`) | `{ "message": "Internal server error" }` |

Contoh pesan validasi model:

```json
{ "message": "Username Required" }
```

```json
{ "message": "Email must be unique" }
```

```json
{ "message": "Invalid email format" }
```

```json
{ "message": "Name Team Required" }
```

## Ringkasan Endpoint

| # | Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- | --- |
| 1 | GET | `/genAI?input=<teks>` | Tidak | Tanya chatbot AI (khusus sepak bola Indonesia; pesan maksimal 500 karakter). |
| 2 | POST | `/register` | Tidak | Daftar user baru. |
| 3 | POST | `/login` | Tidak | Login dengan email & password → `access_token`. |
| 4 | POST | `/google-login` | Tidak | Login dengan Google ID token (header `token`). |
| 5 | POST | `/facebook-login` | Tidak | Login dengan Facebook access token (header `token`). |
| 6 | GET | `/?search=<nama>` | Ya | Ambil semua team (opsional filter nama). |
| 7 | POST | `/` | Ya | Tambah team baru. |
| 8 | GET | `/:id` | Ya | Ambil detail team berdasarkan `id`. |
| 9 | PUT | `/:id` | Ya | Update data team berdasarkan `id`. |
| 10 | DELETE | `/:id` | Ya | Hapus team berdasarkan `id`. |

## Fan club memberships

Fan clubs are separate from legacy user-owned `Teams`. The client `/myTeam`
page now lists confirmed fan club memberships, not legacy saved teams. Legacy
rows and CRUD routes are preserved; no automatic backfill is performed because
those rows have no API-Sports ID. Local votes are not membership evidence.

### Deployment prerequisites

1. Back up the database and review migration
   `migrations/20261019090000-create-fan-club-memberships.js`.
2. Apply pending migrations using the existing Sequelize CLI in the intended
   environment (test on a disposable database first). This creates `FanClubs`
   and `FanClubMemberships`; it does not modify or drop `Teams`.
3. Set server-only `API_SPORTS_KEY` to an authorized API-Sports credential.
   First join of an uncached club verifies its identity through the provider;
   requests time out after 10 seconds. Cached joins, listing, and leaving do
   not require a provider request. Provider failure returns 503 without joining.
4. Deploy the backend before the client. The client uses `VITE_API_URL`.

### Authenticated API

All routes require `Authorization: Bearer <access_token>`. The verified token
and user record determine membership ownership; body/query user IDs are ignored.

- `GET /me/fan-clubs`: 200 `{ message, data: [membership] }`, only current user.
- `PUT /me/fan-clubs/:externalTeamId`: 201 on first join, 200 if already joined;
  returns `{ message, data: membership }`. No body is needed.
- `DELETE /me/fan-clubs/:externalTeamId`: 204, including already absent membership.

A membership contains `id`, `UserId`, `FanClubId`, timestamps, and `FanClub`
metadata including `externalTeamId`. Squad navigation uses that external ID,
never the database primary key. Membership is many-to-many and protected by
unique `(UserId, FanClubId)` and catalog `(provider, externalTeamId)` indexes.
Join uses Sequelize `findOrCreate` inside a transaction. Leaving removes only
the authenticated user's relationship, not the club or another user's membership.
Invalid ID: 400; unrecognized club: 404; missing/invalid/expired token: 401.

The UI disables duplicate joins, waits for server confirmation, exposes retryable
errors, reloads on login/navigation/window focus, and discards results from an
obsolete session. Leave requires confirmation. National teams are also permitted.

### Validation

`npm test -- --runInBand membership.test.js` runs isolated Supertest contracts
with mocked models/provider, without opening or modifying a database. Existing
`team.test.js` and `auth.test.js` use force-sync/drop: run them only against an
explicitly verified disposable test database, serially. Before production, also
test migration up/down and concurrent duplicate joins on PostgreSQL; mocked HTTP
tests cannot prove database locking/constraint behavior. Test that ten simultaneous
joins yield one membership and that two users can join the same club independently.
