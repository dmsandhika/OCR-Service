import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseIc } from "../../src/parsers/ic.parser.js";

describe("Malaysian IC (MyKad) Parser", () => {
  it("should parse MyKad IC text correctly with male gender", () => {
    const rawText = `
KAD PENGENALAN MALAYSIA
MOHD AMIRUL BIN HASSAN
900512-14-5531
WARGANEGARA
ISLAM
NO 15 JALAN AMPANG
50450 KUALA LUMPUR
    `;

    const result = parseIc(rawText);

    assert.equal(result.icNumber, "900512-14-5531");
    assert.equal(result.jantina, "LELAKI");
    assert.equal(result.warganegara, "WARGANEGARA");
    assert.equal(result.agama, "ISLAM");
    assert.equal(result.nama, "MOHD AMIRUL BIN HASSAN");
    assert.ok(result.alamat.includes("NO 15 JALAN AMPANG"));
  });

  it("should parse female gender when the last digit is even", () => {
    const rawText = `
SITI NURHALIZA BINTI AHMAD
920314-10-6784
WARGANEGARA
ISLAM
    `;

    const result = parseIc(rawText);

    assert.equal(result.icNumber, "920314-10-6784");
    assert.equal(result.jantina, "PEREMPUAN");
    assert.equal(result.nama, "SITI NURHALIZA BINTI AHMAD");
  });
});
