import { recognizeText } from "../services/ocr.service.js";
import { requireApiKey } from "../middleware/apiKey.js";
import { DOCUMENT_PARSERS } from "../parsers/index.js";

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
    "Upload an image (PNG, JPEG, WEBP, BMP, or TIFF, max 10MB) and receive the extracted text using Tesseract OCR (English + Indonesian + Malay). Optionally pass `type` to also get structured fields parsed out for a known document layout.",
  tags: ["OCR"],
  security: [{ apiKey: [] }],
  consumes: ["multipart/form-data"],
  body: {
    type: "object",
    properties: {
      file: { isFile: true, description: "Image file to run OCR on" },
      type: {
        type: "object",
        description: "Document type, for structured field extraction. Omit for plain text extraction.",
        properties: {
          value: { type: "string", enum: Object.keys(DOCUMENT_PARSERS) },
        },
      },
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
        type: { type: "string", description: "Document type, if provided" },
        fields: {
          type: "object",
          additionalProperties: true,
          description: "Structured fields parsed from the text, if type was provided",
        },
      },
    },
    400: {
      description: "No file provided, or unsupported document type",
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

// @fastify/multipart's attachFieldsToBody wraps every non-file field as
// { value, fieldname, ... } before validation, so the real body schema for
// `type` above has to describe that wrapper shape. That shape renders as a
// raw JSON textarea in Swagger UI instead of a dropdown, so this transform
// swaps in a clean display-only schema for /docs; it does not affect the
// schema Fastify actually validates requests against.
function swaggerTransform({ schema, url }) {
  return {
    url,
    schema: {
      ...schema,
      body: {
        ...schema.body,
        properties: {
          ...schema.body.properties,
          type: {
            type: "string",
            enum: Object.keys(DOCUMENT_PARSERS),
            description: "Document type, for structured field extraction. Omit for plain text extraction.",
          },
        },
      },
    },
  };
}

export default async function ocrRoutes(fastify) {
  fastify.post(
    "/ocr",
    { schema: ocrSchema, preHandler: requireApiKey, config: { swaggerTransform } },
    async (request, reply) => {
      const file = request.body.file;
      const documentType = request.body.type?.value;

      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return reply.code(415).send({ error: `Unsupported file type: ${file.mimetype}` });
      }

      const buffer = await file.toBuffer();

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return reply.code(413).send({ error: "File exceeds 10MB limit" });
      }

      try {
        const result = await recognizeText(buffer);
        request.log.info({ platform: request.platform, documentType }, "OCR request completed");

        if (documentType) {
          const fields = DOCUMENT_PARSERS[documentType](result.text);
          return reply.send({ ...result, type: documentType, fields });
        }

        return reply.send(result);
      } catch (err) {
        request.log.error(err, "OCR processing failed");
        return reply.code(500).send({ error: "Failed to process image" });
      }
    }
  );
}
