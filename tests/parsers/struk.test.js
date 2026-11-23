import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseStruk } from "../../src/parsers/struk.parser.js";

describe("Receipt (Struk) Parser", () => {
  it("should extract date and total amount from receipt text", () => {
    const rawText = `
TOKO SERBA ADA
JL. MELATI NO. 10
TANGGAL: 18/08/2026
KASIR: 02

ROTI TAWAR        18.000
SUSU UHT          22.500
SUBTOTAL          40.500
TOTAL             40.500
TUNAI             50.000
KEMBALI            9.500

TERIMA KASIH
    `;

    const result = parseStruk(rawText);

    assert.equal(result.date, "18/08/2026");
    assert.equal(result.total, "40500");
  });

  it("should ignore lines with TOTAL DISKON or TOTAL BAYAR when detecting total", () => {
    const rawText = `
TOTAL DISKON: 5.000
TOTAL: 75.000
    `;

    const result = parseStruk(rawText);
    assert.equal(result.total, "75000");
  });
});
