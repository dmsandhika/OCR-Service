import { recognizeText } from "../services/ocr.service.js";
import { requireApiKey } from "../middleware/apiKey.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/tiff",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ocrSchema = {
  summary: "Extract text from an image",
  description:
    "Upload an image (PNG, JPEG, WEBP, BMP, or TIFF, max 10MB) and receive the extracted text using Tesseract OCR (English + Indonesian + Malay).",
  tags: ["OCR"],
  security: [{ apiKey: [] }],
  consumes: ["multipart/form-data"],
  body: {
    type: "object",
    properties: {
      file: { isFile: true, description: "Image file to run OCR on" },
    },
    required: ["file"],
  },
  response: {
    200: {
      description: "Text extracted successfully",
      type: "object",
      properties: {
        text: { type: "string", description: "Extracted text" },
        confidence: { type: "number", description: "OCR confidence score (0-100)" },
      },
    },
    400: {
      description: "No file provided",
      type: "object",
      properties: { error: { type: "string" } },
    },
    401: {
      description: "Invalid or missing API key",
      type: "object",
      properties: { error: { type: "string" } },
    },
    413: {
      description: "File exceeds size limit",
      type: "object",
      properties: { error: { type: "string" } },
    },
    415: {
      description: "Unsupported file type",
      type: "object",
      properties: { error: { type: "string" } },
    },
    500: {
      description: "OCR processing failed",
      type: "object",
      properties: { error: { type: "string" } },
    },
  },
};

export default async function ocrRoutes(fastify) {
  fastify.post("/ocr", { schema: ocrSchema, preHandler: requireApiKey }, async (request, reply) => {
    const file = request.body.file;

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return reply.code(415).send({ error: `Unsupported file type: ${file.mimetype}` });
    }

    const buffer = await file.toBuffer();

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return reply.code(413).send({ error: "File exceeds 10MB limit" });
    }

    try {
      const result = await recognizeText(buffer);
      request.log.info({ platform: request.platform }, "OCR request completed");
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "OCR processing failed");
      return reply.code(500).send({ error: "Failed to process image" });
    }
  });
}
