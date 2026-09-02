const IC_NUMBER_PATTERN = /(\d{6}-\d{2}-\d{4})/;
const RELIGION_KEYWORDS = ["ISLAM", "KRISTIAN", "BUDDHA", "HINDU"];
const NOISE_KEYWORDS = ["WARGANEGARA", "MYKAD", "IDENTITI", ...RELIGION_KEYWORDS];

export function parseIc(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const fields = {};

  const icMatch = text.match(IC_NUMBER_PATTERN);
  if (icMatch) {
    fields.icNumber = icMatch[1];
    const lastDigit = Number(icMatch[1].slice(-1));
    fields.jantina = lastDigit % 2 === 0 ? "PEREMPUAN" : "LELAKI";
  }

  if (/WARGANEGARA/i.test(text)) {
    fields.warganegara = "WARGANEGARA";
  }

  const religion = RELIGION_KEYWORDS.find((word) => new RegExp(word, "i").test(text));
  if (religion) {
    fields.agama = religion;
  }

  const icLineIndex = lines.findIndex((line) => IC_NUMBER_PATTERN.test(line));
  const isNoiseLine = (line) =>
    IC_NUMBER_PATTERN.test(line) || NOISE_KEYWORDS.some((word) => new RegExp(word, "i").test(line));

  if (icLineIndex !== -1) {
    const nameLine = lines.slice(0, icLineIndex).reverse().find((line) => !isNoiseLine(line));
    if (nameLine) fields.nama = nameLine;

    const addressLines = lines.slice(icLineIndex + 1).filter((line) => !isNoiseLine(line));
    if (addressLines.length > 0) fields.alamat = addressLines.join(", ");
  }

  return fields;
}
