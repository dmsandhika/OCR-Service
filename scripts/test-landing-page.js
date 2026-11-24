import fs from "node:fs/promises";
import { OcrClient } from "../clients/js/src/index.js";

// Ambil API key dari config/api-keys.json
const rawConfig = await fs.readFile("./config/api-keys.json", "utf-8");
const config = JSON.parse(rawConfig);
const apiKey = config.keys[0]?.key || "temporary-key";

const client = new OcrClient({
  baseUrl: "http://localhost:3000",
  apiKey: apiKey,
});

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log("ℹ️  Cara pakai: node scripts/test-landing-page.js <path-ke-gambar>");
    console.log("Contoh: node scripts/test-landing-page.js ./my-landing-page.png\n");
    console.log("Memeriksa status server...");
    try {
      const health = await client.health();
      console.log("✅ Server Fastify aktif:", health);
    } catch (e) {
      console.error("❌ Server belum berjalan. Jalankan 'npm run dev' di terminal lain terlebih dahulu!");
    }
    return;
  }

  console.log(`🚀 Mengirim file '${filePath}' ke OCR Service dengan type='landing_page'...\n`);
  const imageBuffer = await fs.readFile(filePath);

  const startTime = Date.now();
  const result = await client.scan(imageBuffer, {
    type: "landing_page",
    filename: filePath.split("/").pop(),
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`✅ Selesai dalam ${duration} detik! Akurasi (confidence): ${result.confidence}%\n`);

  console.log("📌 HASIL EKSTRAKSI POLA LANDING PAGE:");
  console.log("------------------------------------------");
  console.log("🎯 Headlines:", result.fields?.headlines || []);
  console.log("🔘 Tombol CTA:", result.fields?.ctas || []);
  console.log("💰 Harga / Promo:", result.fields?.pricing || []);
  console.log("📞 Kontak:");
  console.log("   - Email:", result.fields?.contacts?.emails || []);
  console.log("   - Telepon/WA:", result.fields?.contacts?.phones || []);
  console.log("   - Website/URL:", result.fields?.contacts?.urls || []);
  console.log("✨ Fitur / Poin:", result.fields?.features || []);
  console.log("❓ FAQ:", result.fields?.faqs || []);
  console.log("💬 Testimoni:", result.fields?.testimonials || []);
  console.log("------------------------------------------");
}

main().catch(console.error);
