# dmsandhika/ocr-client (PHP)

Official PHP Client SDK for OCR Service. Membantu integrasi pemindaian OCR dan parsing dokumen terstruktur (**KTP**, **MyKad Malaysia**, **Paspor**, dan **Struk Belanja**) ke aplikasi PHP dan framework seperti **Laravel** atau **Symfony**.

## Instalasi via Composer

```bash
composer require dmsandhika/ocr-client
```

## Persyaratan
- PHP 8.1 atau lebih baru
- Ekstensi cURL atau Guzzle HTTP

---

## Contoh Penggunaan

### 1. Penggunaan Standar di PHP

```php
<?php

require 'vendor/autoload.php';

use Dmsandhika\OcrClient\OcrClient;
use Dmsandhika\OcrClient\Exceptions\OcrException;

$client = new OcrClient(
    baseUrl: 'http://localhost:3000',
    apiKey: 'your-platform-api-key'
);

try {
    // Memindai KTP
    $result = $client->scan(__DIR__ . '/sample-ktp.jpg', type: 'ktp');

    echo "Teks OCR:\n" . $result['text'] . "\n";
    echo "Akurasi: " . $result['confidence'] . "%\n";
    
    // Field terstruktur otomatis
    if (isset($result['fields'])) {
        echo "NIK: " . ($result['fields']['nik'] ?? '-') . "\n";
        echo "Nama: " . ($result['fields']['nama'] ?? '-') . "\n";
        echo "Alamat: " . ($result['fields']['alamat'] ?? '-') . "\n";
    }
} catch (OcrException $e) {
    echo "Gagal OCR: " . $e->getMessage() . " (Status: " . $e->getStatusCode() . ")\n";
}
```

### 2. Penggunaan di Controller Laravel

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Dmsandhika\OcrClient\OcrClient;

class VerificationController extends Controller
{
    public function verifyKtp(Request $request, OcrClient $ocr)
    {
        $request->validate([
            'ktp_image' => 'required|image|max:10240',
        ]);

        $file = $request->file('ktp_image');
        
        // Pindai langsung file upload Laravel
        $result = $ocr->scan($file->getRealPath(), 'ktp');

        return response()->json([
            'status' => 'success',
            'nik'    => $result['fields']['nik'] ?? null,
            'nama'   => $result['fields']['nama'] ?? null,
            'score'  => $result['confidence'],
        ]);
    }
}
```

## Tipe Dokumen yang Didukung

- `ktp` — Kartu Tanda Penduduk Indonesia (NIK, Nama, TTL, Jenis Kelamin, Agama, Alamat, dll).
- `ic` — MyKad Malaysia (Nomor IC, Jantina/Gender otomatis, Agama, Alamat).
- `passport` — Standar Machine-Readable Zone (MRZ) Paspor internasional.
- `struk` — Struk belanja / kuitansi (Tanggal transaksi dan Total nominal).

## Lisensi

[MIT](../../LICENSE)
