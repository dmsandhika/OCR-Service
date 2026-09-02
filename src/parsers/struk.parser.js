const DATE_PATTERN = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/;
const TOTAL_PATTERN = /\bTOTAL\b(?!\s*(DISKON|DISCOUNT|BAYAR))[^\d]{0,10}([\d.,]+)/i;

export function parseStruk(text) {
  const fields = {};

  const dateMatch = text.match(DATE_PATTERN);
  if (dateMatch) fields.date = dateMatch[1];

  const totalMatch = text.match(TOTAL_PATTERN);
  if (totalMatch) fields.total = totalMatch[2].replace(/[^\d]/g, "");

  return fields;
}
