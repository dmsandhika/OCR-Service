# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **OCR Service**! 

Dokumentasi ini menjelaskan alur kerja, standar kode, dan cara menambahkan parser dokumen baru.

## Memulai Pengembangan Lokal

1. **Fork & Clone** repositori ini ke komputer Anda.
2. Pastikan terpasang **Node.js 20+**.
3. Pasang dependensi proyek:
   ```bash
   npm install
   ```
4. Buat file konfigurasi `.env` dan `config/api-keys.json`:
   ```bash
   cp .env.example .env
   npm run generate-key -- local-test
   ```
5. Jalankan server dalam mode development:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000/docs` untuk mencoba API via antarmuka Swagger UI.

---

## Cara Menambahkan Parser Dokumen Baru

Jika ingin menambahkan dukungan ekstraksi dokumen baru (misalnya SIM, NPWP, atau Invoice):

1. Buat file parser baru di `src/parsers/<nama-dokumen>.parser.js`.
2. Terapkan fungsi pemrosesan teks yang mengembalikan objek data terstruktur:
   ```javascript
   export function parseNamaDokumen(text) {
     // Logika regex atau ekstraksi teks
     return {
       // field yang berhasil diekstrak
     };
   }
   ```
3. Daftarkan parser baru tersebut di `src/parsers/index.js`.
4. Perbarui dokumentasi di `README.md` pada tabel daftar dokumen yang didukung.

---

## Pedoman Pull Request

1. Buat branch baru dari branch `master` dengan nama deskriptif (contoh: `feat/sim-parser` atau `fix/ktp-nik-regex`).
2. Pastikan format kode konsisten dan tidak ada file konfigurasi pribadi (`.env`, `api-keys.json`) yang ikut terunggah.
3. Buat Pull Request dengan deskripsi yang jelas mengenai perubahan yang Anda lakukan.
