import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseKtp } from "../../src/parsers/ktp.parser.js";

describe("KTP Parser", () => {
  it("should correctly parse standard Indonesian KTP text", () => {
    const rawText = `
PROVINSI DKI JAKARTA
JAKARTA SELATAN
NIK : 3171012304950001
Nama : BUDI SANTOSO
Tempat/Tgl Lahir : JAKARTA, 23-04-1995
Jenis Kelamin : LAKI-LAKI
Alamat : JL. JENDERAL SUDIRMAN KAV 52
Agama : ISLAM
Status Perkawinan : BELUM KAWIN
Pekerjaan : KARYAWAN SWASTA
Kewarganegaraan : WNI
Berlaku Hingga : SEUMUR HIDUP
    `;

    const result = parseKtp(rawText);

    assert.equal(result.nik, "3171012304950001");
    assert.equal(result.nama, "BUDI SANTOSO");
    assert.equal(result.tempatTglLahir, "JAKARTA, 23-04-1995");
    assert.equal(result.jenisKelamin, "LAKI-LAKI");
    assert.equal(result.alamat, "JL. JENDERAL SUDIRMAN KAV 52");
    assert.equal(result.agama, "ISLAM");
    assert.equal(result.statusPerkawinan, "BELUM KAWIN");
    assert.equal(result.pekerjaan, "KARYAWAN SWASTA");
    assert.equal(result.kewarganegaraan, "WNI");
  });

  it("should handle partial or missing fields gracefully", () => {
    const rawText = "NIK: 3201015501000002\nNama: SITI AMINAH\nJenis Kelamin: PEREMPUAN";
    const result = parseKtp(rawText);

    assert.equal(result.nik, "3201015501000002");
    assert.equal(result.nama, "SITI AMINAH");
    assert.equal(result.jenisKelamin, "PEREMPUAN");
    assert.equal(result.agama, undefined);
    assert.equal(result.alamat, undefined);
  });
});
