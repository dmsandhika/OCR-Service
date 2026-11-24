/**
 * Parser for Landing Page screenshots.
 * Extracts CTAs, Pricing, Headlines, Contacts, Features, FAQs, and Social Proof.
 */
export function parseLandingPage(text) {
  if (!text || typeof text !== "string") {
    return {
      headlines: [],
      ctas: [],
      pricing: [],
      contacts: { emails: [], phones: [], urls: [] },
      features: [],
      faqs: [],
      testimonials: [],
      meta: { totalLines: 0, estimatedSections: 0 },
    };
  }

  const rawLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // 1. Email extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = Array.from(new Set(text.match(emailRegex) || []));

  // 2. Phone / WhatsApp extraction
  const phoneRegex = /(?:\+?62|08|\+?1|\+?60)[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,5}/g;
  const phones = Array.from(new Set(text.match(phoneRegex) || []));

  // 3. URLs & Domains
  const urlRegex = /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}(?:\/[^\s)]*)?\b/g;
  const urls = Array.from(new Set(text.match(urlRegex) || []))
    .filter((url) => !url.includes("@"));

  // 4. CTAs (Call to Action buttons)
  const ctaPatterns = [
    /\b(daftar\s*sekarang|registrasi\s*sekarang|buat\s*akun)\b/i,
    /\b(coba\s*gratis|coba\s*sekarang|free\s*trial)\b/i,
    /\b(get\s*started|start\s*free\s*trial|try\s*for\s*free)\b/i,
    /\b(beli\s*sekarang|pesan\s*sekarang|buy\s*now|order\s*now)\b/i,
    /\b(hubungi\s*kami|contact\s*us|konsultasi\s*gratis|book\s*a\s*demo)\b/i,
    /\b(pelajari\s*lebih\s*lanjut|learn\s*more|read\s*more)\b/i,
    /\b(gabung\s*sekarang|join\s*now|join\s*community)\b/i,
    /\b(download\s*now|unduh\s*sekarang|install\s*app)\b/i,
    /\b(subscribe\s*now|berlangganan)\b/i,
    /\b(sign\s*up|masuk\s*ke\s*akun|login)\b/i,
    /\b(claim\s*promo|klaim\s*voucher|ambil\s*diskon)\b/i,
  ];

  const ctas = [];
  for (const line of rawLines) {
    if (line.length <= 60) {
      for (const pattern of ctaPatterns) {
        if (pattern.test(line)) {
          if (!ctas.includes(line)) {
            ctas.push(line);
          }
          break;
        }
      }
    }
  }

  // 5. Pricing & Promotions
  const pricingRegex = /(?:Rp\.?|IDR|\$|USD|EUR|SGD|RM)\s*[\d.,]+(?:\s*(?:\/|per)\s*(?:bulan|mo|month|tahun|year|hari|user))?/gi;
  const pricingMatches = text.match(pricingRegex) || [];
  const discountRegex = /(?:\d{1,2}%\s*(?:off|diskon|potongan|hemat)|(?:diskon|hemat|save|potongan)\s*\d{1,2}%|\b\d{1,2}%)/gi;
  const discountMatches = text.match(discountRegex) || [];
  const pricing = Array.from(new Set([...pricingMatches, ...discountMatches]));

  // 6. Headlines (Prominent lines, usually title-case or uppercase near hero)
  const headlines = [];
  const headlineKeywords = /\b(solusi|platform|aplikasi|cara|mudah|terbaik|software|transformasi|revolusi|ai|build|grow|automate|leading|all-in-one)\b/i;
  for (let i = 0; i < Math.min(rawLines.length, 30); i++) {
    const line = rawLines[i];
    if (
      line.length >= 10 &&
      line.length <= 95 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !ctaPatterns.some((p) => p.test(line)) &&
      (headlineKeywords.test(line) || /^[A-Z0-9\s.,!?-]+$/.test(line) || line.split(" ").length <= 8)
    ) {
      if (!headlines.includes(line)) {
        headlines.push(line);
      }
      if (headlines.length >= 5) break;
    }
  }

  // 7. Features / Key Benefits
  const featureBulletRegex = /^[-•*✓✔►]\s*(.+)/;
  const features = [];
  for (const line of rawLines) {
    const match = line.match(featureBulletRegex);
    if (match) {
      features.push(match[1].trim());
    }
  }

  // 8. FAQs / Questions
  const faqs = [];
  for (const line of rawLines) {
    if (
      (line.endsWith("?") || /^(faq|q:|pertanyaan|apa\s*itu|bagaimana\s*cara|kenapa|why|how\s*to)/i.test(line)) &&
      line.length >= 10 &&
      line.length <= 130
    ) {
      faqs.push(line);
    }
  }

  // 9. Testimonials / Social Proof
  const testimonials = [];
  for (const line of rawLines) {
    if (
      (/^["“].+["”]$/.test(line) || /\b(rating|bintang|stars?|review|kata\s*mereka|trusted\s*by|klien\s*kami)\b/i.test(line)) &&
      line.length <= 150
    ) {
      testimonials.push(line);
    }
  }

  return {
    headlines,
    ctas,
    pricing,
    contacts: {
      emails,
      phones,
      urls,
    },
    features,
    faqs,
    testimonials,
    meta: {
      totalLines: rawLines.length,
      estimatedSections: Math.max(1, Math.ceil(rawLines.length / 15)),
    },
  };
}
