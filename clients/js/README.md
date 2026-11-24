# @dmsandhika/ocr-client

Official JavaScript & TypeScript client library for OCR Service.

## Fitur

- Mendukung Node.js (18+), browser, Deno, dan Bun.
- Zero external dependencies (menggunakan native `fetch` dan `FormData`).
- Lengkap dengan TypeScript definitions (`.d.ts`).
- Ekstraksi terstruktur otomatis untuk **KTP**, **MyKad Malaysia (IC)**, **Paspor (MRZ)**, **Struk/Receipt**, dan **Landing Page** (CTAs, Pricing, Kontak, dsb).
- Dukungan **Bulk Scan** (`scanBulk`) dengan concurrency control.

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

// Scan Screenshot Landing Page (Otomatis deteksi CTA, Harga, Kontak, Headline)
const lpBuffer = await fs.readFile('./landing-page-full.png');
const lp = await client.scan(lpBuffer, { type: 'landing_page' });
console.log('Headlines:', lp.fields?.headlines);
console.log('Tombol CTA:', lp.fields?.ctas);
console.log('Harga:', lp.fields?.pricing);
console.log('Kontak:', lp.fields?.contacts);

// Bulk Scan Banyak Gambar Sekaligus (Concurrency Control)
const bulkResults = await client.scanBulk([imageBuffer, lpBuffer], {
  concurrency: 2,
});
console.log('Total diproses:', bulkResults.length);
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
