import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePassport } from "../../src/parsers/passport.parser.js";

describe("Passport MRZ Parser", () => {
  it("should correctly parse 2-line ICAO MRZ passport data", () => {
    const rawText = `
PASPOR / PASSPORT
REPUBLIK INDONESIA
P<IDNPRATAMA<<DIMAS<<<<<<<<<<<<<<<<<<<<<<<<<<
A1234567<3IDN9508155M3008152<<<<<<<<<<<<<<04
    `;

    const result = parsePassport(rawText);

    assert.equal(result.countryCode, "IDN");
    assert.equal(result.surname, "PRATAMA");
    assert.equal(result.givenNames, "DIMAS");
    assert.equal(result.passportNumber, "A1234567");
    assert.equal(result.nationality, "IDN");
    assert.equal(result.dateOfBirth, "1995-08-15");
    assert.equal(result.sex, "M");
    assert.equal(result.expiryDate, "2030-08-15");
  });

  it("should handle empty or invalid text without crashing", () => {
    const result = parsePassport("Sample text without any MRZ line");
    assert.deepEqual(result, {});
  });
});
