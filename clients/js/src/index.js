/**
 * Error class thrown when the OCR Service returns an error.
 */
export class OcrError extends Error {
  /**
   * @param {string} message 
   * @param {number} statusCode 
   * @param {any} [responseBody]
   */
  constructor(message, statusCode, responseBody) {
    super(message);
    this.name = "OcrError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Main Client for communicating with the OCR Service.
 */
export class OcrClient {
  /**
   * @param {Object} options
   * @param {string} options.baseUrl URL of the OCR Service (e.g. 'http://localhost:3000')
   * @param {string} options.apiKey API Key for authentication (sent via x-api-key)
   * @param {typeof fetch} [options.fetch] Custom fetch implementation (optional)
   */
  constructor({ baseUrl, apiKey, fetch: customFetch }) {
    if (!baseUrl) {
      throw new Error("OcrClient requires 'baseUrl'");
    }
    if (!apiKey) {
      throw new Error("OcrClient requires 'apiKey'");
    }

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.fetch = customFetch || globalThis.fetch;

    if (!this.fetch) {
      throw new Error("No global 'fetch' found. Please provide a custom fetch implementation.");
    }
  }

  /**
   * Check service health.
   * @returns {Promise<{ status: string }>}
   */
  async health() {
    const res = await this.fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new OcrError(`Health check failed with status ${res.status}`, res.status);
    }
    return res.json();
  }

  /**
   * Scan and extract text and structured fields from an image file.
   * 
   * @param {Blob | File | Buffer | Uint8Array} file File data or buffer to scan
   * @param {Object} [options]
   * @param {'ktp' | 'ic' | 'passport' | 'struk'} [options.type] Document type parser
   * @param {string} [options.filename='image.jpg'] Filename for multipart upload
   * @returns {Promise<{ text: string, confidence: number, type?: string, fields?: Record<string, any> }>}
   */
  async scan(file, options = {}) {
    const formData = new FormData();

    let blob;
    if (typeof Blob !== "undefined" && file instanceof Blob) {
      blob = file;
    } else if (file instanceof Uint8Array || (typeof Buffer !== "undefined" && Buffer.isBuffer(file))) {
      blob = new Blob([file], { type: "image/jpeg" });
    } else {
      blob = file;
    }

    formData.append("file", blob, options.filename || "image.jpg");

    if (options.type) {
      formData.append("type", options.type);
    }

    const response = await this.fetch(`${this.baseUrl}/ocr`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `OCR request failed with status ${response.status}`;
      throw new OcrError(errorMsg, response.status, data);
    }

    return data;
  }
}
