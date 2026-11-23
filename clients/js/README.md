# @dmsandhika/ocr-client

Official JavaScript & TypeScript client library for OCR Service.

## Fitur

- Mendukung Node.js (18+), browser, Deno, dan Bun.
- Zero external dependencies (menggunakan native `fetch` dan `FormData`).
- Lengkap dengan TypeScript definitions (`.d.ts`).
- Ekstraksi terstruktur otomatis untuk **KTP**, **MyKad Malaysia (IC)**, **Paspor (MRZ)**, dan **Struk/Receipt**.

## Instalasi

```bash
npm install @dmsandhika/ocr-client
```

## Penggunaan

### Node.js (ESM / TypeScript)

```typescript
import { OcrClient } from '@dmsandhika/ocr-client';
import fs from 'node:fs/promises';

const client = new OcrClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
});

// Periksa kesehatan server
await client.health();

// Scan KTP
const imageBuffer = await fs.readFile('./sample-ktp.jpg');
const result = await client.scan(imageBuffer, { type: 'ktp' });

console.log('NIK:', result.fields?.nik);
console.log('Nama:', result.fields?.nama);
console.log('Confidence:', result.confidence);
```

### Browser (File Input)

```javascript
import { OcrClient } from '@dmsandhika/ocr-client';

const client = new OcrClient({
  baseUrl: 'https://ocr.yourdomain.com',
  apiKey: 'your-public-key',
});

const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const res = await client.scan(file, { type: 'struk' });
  console.log('Total Belanja:', res.fields?.total);
});
```

## Lisensi

[MIT](../../LICENSE)
