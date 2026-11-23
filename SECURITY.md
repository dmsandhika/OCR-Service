# Kebijakan Keamanan (Security Policy)

Keamanan layanan OCR ini sangat penting, terutama karena memproses berkas unggahan gambar dan kunci otentikasi API.

## Versi yang Didukung

| Versi | Didukung? |
|-------|-----------|
| 1.x   | Ya        |

## Melaporkan Kerentanan

Jika Anda menemukan celah keamanan (vulnerability) pada proyek ini:

1. **Jangan membuat issue publik** di GitHub Issues.
2. Kirimkan laporan secara privat melalui email ke: `dmsandhika87@gmail.com`.
3. Sertakan detail berikut:
   - Deskripsi kerentanan.
   - Langkah-langkah reproduksi (proof-of-concept / request sample).
   - Dampak potensial dari kerentanan tersebut.

Kami akan meninjau laporan Anda dalam kurun waktu 48 jam dan memberikan pembaruan perbaikan secepatnya.

## Panduan Keamanan untuk Pengguna

- Selalu simpan file `config/api-keys.json` di tempat aman dan jangan sampai ter-commit ke repositori publik.
- Atur batas ukuran berkas (`fileSize` limit) sesuai kapasitas RAM server Anda, karena pemrosesan OCR membutuhkan alokasi memori yang cukup besar.
- Disarankan menjalankan layanan ini di balik Reverse Proxy (seperti Nginx, Caddy, atau Cloudflare) dengan pembatasan laju request (rate limiting) dan HTTPS aktif.
