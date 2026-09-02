function cleanMrzLine(line) {
  return line.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9<]/g, "");
}

function parseMrzDate(yymmdd) {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const [yy, mm, dd] = [yymmdd.slice(0, 2), yymmdd.slice(2, 4), yymmdd.slice(4, 6)];
  const century = Number(yy) > 50 ? "19" : "20";
  return `${century}${yy}-${mm}-${dd}`;
}

export function parsePassport(text) {
  const lines = text
    .split("\n")
    .map((line) => cleanMrzLine(line.trim()))
    .filter((line) => line.length >= 40);

  const fields = {};

  const line1Index = lines.findIndex((line) => /^P[A-Z<]/.test(line));
  const line1 = lines[line1Index];
  const line2 = line1Index !== -1 ? lines[line1Index + 1] : undefined;

  if (line1) {
    fields.countryCode = line1.slice(2, 5).replace(/</g, "");
    const [surname, givenNames] = line1.slice(5).replace(/<+$/, "").split("<<");
    if (surname) fields.surname = surname.replace(/</g, " ").trim();
    if (givenNames) fields.givenNames = givenNames.replace(/</g, " ").trim();
  }

  if (line2 && line2.length >= 28) {
    fields.passportNumber = line2.slice(0, 9).replace(/</g, "");
    fields.nationality = line2.slice(10, 13).replace(/</g, "");
    fields.dateOfBirth = parseMrzDate(line2.slice(13, 19));
    if (line2[20] === "M" || line2[20] === "F") fields.sex = line2[20];
    fields.expiryDate = parseMrzDate(line2.slice(21, 27));
  }

  return fields;
}
