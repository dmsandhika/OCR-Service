# OCR Service

[![CI](https://github.com/dmsandhika/OCR-Service/actions/workflows/ci.yml/badge.svg)](https://github.com/dmsandhika/OCR-Service/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

OCR service powered by [Tesseract.js](https://github.com/naptha/tesseract.js), built as a standalone API so it can be reused across multiple platforms (web, mobile, backend integrations, etc). Supports English, Indonesian, and Malay text out of the box, plus optional structured field extraction for a few known document layouts (KTP, Malaysian IC, passport, and receipts).

## Features

- `POST /ocr` — upload an image, get back extracted text
- Optional structured field extraction (`type=ktp`, `ic`, `passport`, or `struk`)
- Per-platform API keys — each client gets its own key, revocable independently
- Interactive API docs at `/docs` (Swagger UI)
- Dockerized, with a persistent cache for Tesseract's language data

## Client SDKs (NPM & Composer)

Official client libraries are available for fast integration:

- **JavaScript / TypeScript (NPM)**: [`@dmsandhika/ocr-client`](clients/js)
  ```bash
  npm install @dmsandhika/ocr-client
  ```
- **PHP / Laravel (Composer)**: [`dmsandhika/ocr-client`](clients/php)
  ```bash
  composer require dmsandhika/ocr-client
  ```

## Tech Stack

- **Fastify** — HTTP server
- **tesseract.js** — OCR engine (runs server-side, not in the browser)
- **@fastify/multipart** — file upload handling
- **@fastify/swagger** + **@fastify/swagger-ui** — API documentation

## Getting Started

### Prerequisites

- Node.js 20+
- (Optional) Docker, for containerized deployment

### Local development

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000` (override with `PORT`).

### Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `TESSDATA_CACHE_PATH` | `./.cache/tesseract` | Where downloaded Tesseract language data is cached |
| `API_KEYS_PATH` | `./config/api-keys.json` | Path to the API keys config file |

### API keys

Each platform that calls this service needs its own API key. Keys live in `config/api-keys.json` (gitignored — copy `config/api-keys.example.json` to get started), and are sent via the `x-api-key` header.

Generate a new key for a platform:

```bash
npm run generate-key -- <platform-name>
```

This appends the key to `config/api-keys.json` and prints it once — give it to whoever owns that platform.

If `config/api-keys.json` doesn't exist yet (e.g. fresh clone), the server generates a temporary key on startup and logs it — fine for local testing, not for anything shared.

## API

Full interactive docs (with a "try it out" file upload) are at `http://localhost:3000/docs` once the server is running.

### `POST /ocr`

**Headers:** `x-api-key: <your-key>`

**Body:** `multipart/form-data`

| Field | Required | Description |
|---|---|---|
| `file` | Yes | Image file — PNG, JPEG, WEBP, BMP, or TIFF, max 10MB |
| `type` | No | `ktp`, `ic`, `passport`, or `struk` — enables structured field extraction |

**Response**

```json
{
  "text": "extracted text...",
  "confidence": 91
}
```

With `type` set, the response also includes `type` and a `fields` object with whatever that document's parser could extract:

| `type` | Fields | Notes |
|---|---|---|
| `ktp` | nik, nama, tempatTglLahir, jenisKelamin, alamat, agama, statusPerkawinan, pekerjaan, kewarganegaraan | Reliable — Indonesian ID cards print explicit field labels |
| `ic` | icNumber, jantina, warganegara, agama, nama, alamat | IC number is reliable (pattern-matched); nama/alamat are best-effort since MyKad has no field labels |
| `passport` | countryCode, surname, givenNames, passportNumber, nationality, dateOfBirth, sex, expiryDate | Parsed from the MRZ (machine-readable zone), not the visual fields — much more OCR-reliable |
| `struk` | date, total | Intentionally limited — line-item parsing varies too much per merchant to generalize with regex |

## Docker

```bash
docker compose up -d --build
```

This builds the image, starts the service on `PORT` (default `3000`), and mounts:
- a named volume for the Tesseract language cache (`tessdata-cache`), so traineddata isn't re-downloaded on every restart
- `./config/api-keys.json` read-only into the container, so keys can be rotated without rebuilding

## Project Structure

```
clients/
  js/                    # JavaScript / TypeScript SDK (NPM)
  php/                   # PHP & Laravel SDK (Composer)
src/
  server.js              # Fastify app setup, Swagger, graceful shutdown
  config/apiKeys.js       # Loads config/api-keys.json, falls back to a temp key
  middleware/apiKey.js    # x-api-key auth
  routes/ocr.route.js     # POST /ocr
  services/ocr.service.js # Tesseract worker wrapper
  parsers/                # Per-document-type field extraction
tests/                   # Automated unit tests for document parsers
scripts/
  generate-api-key.js     # Generates and appends a new platform API key
```

## Known Limitations

- Document-type parsers (KTP, IC, passport, struk) have only been validated against clean synthetic test images, not real-world photos (skew, blur, lighting). Regex patterns may need tuning against real samples.
- Struk parsing only extracts date and total — no line items.
- OCR runs synchronously per request; concurrent or very large uploads may be slow. An async job queue is a planned next step if throughput becomes an issue.
