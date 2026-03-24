# URL Shortener

A small REST API that shortens long URLs, ties them to registered users, and redirects visitors by short code. Built as a Node.js course project using Express, PostgreSQL, and Drizzle ORM.

## Features

- User signup and login with JWT (`Bearer` token)
- Create short links with an optional custom code (defaults to a 6-character NanoID)
- List and delete your own shortened URLs
- Public redirect: `GET /{shortCode}` resolves to the stored target URL

## Tech stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express 5
- **Database:** PostgreSQL 17
- **ORM:** Drizzle ORM + Drizzle Kit
- **Validation:** Zod
- **Auth:** JSON Web Tokens, salted password hashing

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)
- Docker (optional, for running PostgreSQL locally)

## Quick start

### 1. Clone and install

```bash
git clone <repository-url>
cd url-shortener
pnpm install
```

### 2. Environment

Copy the example env file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `PORT`          | HTTP port (default `8000` if unset) |
| `NODE_ENV`      | e.g. `development`                   |
| `DATABASE_URL`  | PostgreSQL connection string         |
| `JWT_SECRET`    | Secret used to sign JWTs             |

Use a strong, unique `JWT_SECRET` in any shared or production environment.

### 3. Database

Start PostgreSQL with Docker Compose (matches the sample `DATABASE_URL` in `.env.example`):

```bash
docker compose up -d
```

Apply the schema to the database:

```bash
pnpm db:push
```

### 4. Run the server

```bash
pnpm dev
```

The API listens on `http://localhost:8000` by default (or whatever you set in `PORT`).

## Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `pnpm dev`        | Start the server with `node --watch` (auto-reload) |
| `pnpm db:push`    | Push Drizzle schema to the database              |
| `pnpm db:studio`  | Open Drizzle Studio for the configured database  |

## API overview

Unless noted, send JSON with `Content-Type: application/json`.

### Public

| Method | Path        | Description                    |
|--------|-------------|--------------------------------|
| `GET`  | `/`         | Welcome message                |
| `GET`  | `/health`   | Health check + server uptime   |
| `POST` | `/auth/signup` | Register a new user       |
| `POST` | `/auth/login`  | Log in; returns a JWT      |
| `GET`  | `/{shortCode}` | **302 redirect** to target URL |

### Authenticated

Send `Authorization: Bearer <token>` (token from `/auth/login`).

| Method   | Path        | Description                              |
|----------|-------------|------------------------------------------|
| `GET`    | `/codes`    | List shortened URLs for the current user |
| `POST`   | `/shorten`  | Create a short link                      |
| `DELETE` | `/{id}`     | Delete a short link by record UUID       |

### Request bodies

**`POST /auth/signup`**

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "password": "your-password"
}
```

Password must be at least 3 characters (as defined in validation).

**`POST /auth/login`**

```json
{
  "email": "ada@example.com",
  "password": "your-password"
}
```

**`POST /shorten`**

```json
{
  "url": "https://example.com/long/path",
  "code": "optional-custom-code"
}
```

If `code` is omitted, a random short code is generated.

## Example flow

```bash
# Sign up
curl -s -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@example.com","password":"secret"}'

# Log in and capture token (use jq or copy from response)
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secret"}' | jq -r '.data.token')

# Shorten a URL
curl -s -X POST http://localhost:8000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"url":"https://nodejs.org/"}'

# Follow redirect in browser or: curl -I http://localhost:8000/<shortCode>
```

## Project layout

```
├── db/                 # Drizzle database client
├── drizzle.config.js   # Drizzle Kit configuration
├── index.js            # Express app entry
├── middlewares/        # Auth middleware
├── models/             # Drizzle table definitions
├── routes/             # HTTP routes (users, URLs)
├── services/           # Business logic
├── utils/              # Hashing, JWT helpers
└── validation/         # Zod schemas
```

## License

MIT

## Author

Abdul Halim
