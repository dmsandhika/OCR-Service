import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLandingPage } from "../../src/parsers/landing-page.parser.js";

describe("Landing Page Parser", () => {
  it("should extract CTAs, pricing, contacts, features, and headlines accurately", () => {
    const rawText = `
PLATFORM OTOMASI DOKUMEN DENGAN AI
Solusi Cerdas untuk Percepatan Bisnis Anda di Indonesia

Coba Gratis 14 Hari
Hubungi Kami

Keunggulan Layanan:
• Akurasi OCR hingga 99% dengan model deep learning
• Ekstraksi KTP, Paspor, dan Struk dalam 1 detik
• Integrasi mudah via REST API dan SDK lengkap

Paket Berlangganan:
Mulai dari Rp 299.000 / bulan
Diskon 25% untuk pembayaran tahunan
Paket Enterprise $99 / mo

Pertanyaan yang Sering Diajukan:
Apa itu OCR Service?
Bagaimana cara integrasi ke sistem kami?

Kata Mereka:
"Aplikasi ini menghemat waktu verifikasi data kami hingga 80%" - PT Digital Maju

Hubungi Tim Support kami:
Email: support@ocrservice.id atau sales@ocrservice.id
WhatsApp: 081234567890
Website: https://ocrservice.id
    `;

    const result = parseLandingPage(rawText);

    // Headlines
    assert.ok(result.headlines.length > 0);
    assert.ok(result.headlines.some((h) => h.includes("PLATFORM OTOMASI DOKUMEN")));

    // CTAs
    assert.ok(result.ctas.includes("Coba Gratis 14 Hari"));
    assert.ok(result.ctas.includes("Hubungi Kami"));

    // Pricing
    assert.ok(result.pricing.some((p) => p.includes("299.000")));
    assert.ok(result.pricing.some((p) => p.includes("25%")));
    assert.ok(result.pricing.some((p) => p.includes("$99")));

    // Contacts
    assert.ok(result.contacts.emails.includes("support@ocrservice.id"));
    assert.ok(result.contacts.emails.includes("sales@ocrservice.id"));
    assert.ok(result.contacts.phones.some((phone) => phone.includes("081234567890")));
    assert.ok(result.contacts.urls.some((url) => url.includes("ocrservice.id")));

    // Features
    assert.ok(result.features.length >= 3);
    assert.ok(result.features.some((f) => f.includes("Akurasi OCR hingga 99%")));

    // FAQs
    assert.ok(result.faqs.some((q) => q.includes("Apa itu OCR Service?")));

    // Testimonials
    assert.ok(result.testimonials.length > 0);

    // Metadata
    assert.ok(result.meta.totalLines > 0);
  });

  it("should handle empty or whitespace-only text gracefully", () => {
    const result = parseLandingPage("");
    assert.deepEqual(result.ctas, []);
    assert.deepEqual(result.pricing, []);
    assert.deepEqual(result.contacts.emails, []);
  });
});
