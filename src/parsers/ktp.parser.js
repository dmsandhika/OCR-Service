const FIELD_PATTERNS = {
  nik: /NIK\s*[:\-]?\s*(\d{16})/i,
  nama: /Nama\s*[:\-]?\s*(.+)/i,
  tempatTglLahir: /Tempat\W*Tgl\W*Lahir\s*[:\-]?\s*(.+)/i,
  jenisKelamin: /Jenis\s*Kelamin\s*[:\-]?\s*(LAKI-LAKI|PEREMPUAN)/i,
  alamat: /Alamat\s*[:\-]?\s*(.+)/i,
  agama: /Agama\s*[:\-]?\s*(.+)/i,
  statusPerkawinan: /Status\s*Perkawinan\s*[:\-]?\s*(.+)/i,
  pekerjaan: /Pekerjaan\s*[:\-]?\s*(.+)/i,
  kewarganegaraan: /Kewarganegaraan\s*[:\-]?\s*(.+)/i,
};

export function parseKtp(text) {
  const lines = text.split("\n");
  const fields = {};

  for (const [field, pattern] of Object.entries(FIELD_PATTERNS)) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        fields[field] = match[1].trim();
        break;
      }
    }
  }

  return fields;
}
