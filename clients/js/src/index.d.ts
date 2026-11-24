export type DocumentType = 'ktp' | 'ic' | 'passport' | 'struk' | 'landing_page';

export interface LandingPageContacts {
  emails: string[];
  phones: string[];
  urls: string[];
}

export interface LandingPageMeta {
  totalLines: number;
  estimatedSections: number;
}

export interface LandingPageFields {
  headlines: string[];
  ctas: string[];
  pricing: string[];
  contacts: LandingPageContacts;
  features: string[];
  faqs: string[];
  testimonials: string[];
  meta: LandingPageMeta;
  [key: string]: any;
}

export interface KtpFields {
  nik?: string;
  nama?: string;
  tempatTglLahir?: string;
  jenisKelamin?: 'LAKI-LAKI' | 'PEREMPUAN';
  alamat?: string;
  agama?: string;
  statusPerkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  [key: string]: any;
}

export interface MyKadIcFields {
  icNumber?: string;
  jantina?: 'LELAKI' | 'PEREMPUAN';
  warganegara?: string;
  agama?: string;
  nama?: string;
  alamat?: string;
  [key: string]: any;
}

export interface PassportFields {
  countryCode?: string;
  surname?: string;
  givenNames?: string;
  passportNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  sex?: 'M' | 'F';
  expiryDate?: string;
  [key: string]: any;
}

export interface StrukFields {
  date?: string;
  total?: string;
  [key: string]: any;
}

export interface OcrResult<T = Record<string, any>> {
  text: string;
  confidence: number;
  type?: DocumentType;
  fields?: T;
}

export interface OcrClientOptions {
  baseUrl: string;
  apiKey: string;
  fetch?: typeof fetch;
}

export interface ScanOptions {
  type?: DocumentType;
  filename?: string;
}

export interface BulkScanOptions extends ScanOptions {
  concurrency?: number;
}

export declare class OcrError extends Error {
  statusCode: number;
  responseBody?: any;
  constructor(message: string, statusCode: number, responseBody?: any);
}

export declare class OcrClient {
  constructor(options: OcrClientOptions);
  health(): Promise<{ status: string }>;
  scan<T = Record<string, any>>(
    file: Blob | File | Uint8Array | ArrayBuffer,
    options?: ScanOptions
  ): Promise<OcrResult<T>>;
  scanBulk<T = Record<string, any>>(
    files: Array<Blob | File | Uint8Array | ArrayBuffer>,
    options?: BulkScanOptions
  ): Promise<Array<OcrResult<T> & { error?: string; statusCode?: number }>>;
}
