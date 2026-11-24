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

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

const ocrSchema = {
  summary: "Extract text from an image",
  description:
    "Upload an image (PNG, JPEG, WEBP, BMP, or TIFF, max 30MB) and receive the extracted text using Tesseract OCR (English + Indonesian + Malay). Supports full landing page screenshots and optional structured field extraction (`ktp`, `ic`, `passport`, `struk`, `landing_page`).",
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

const bulkOcrSchema = {
  summary: "Extract text from multiple images in bulk",
  description:
    "Upload one or multiple images (max 30MB each) and extract text concurrently, with optional structured field extraction.",
  tags: ["OCR"],
  security: [{ apiKey: [] }],
  consumes: ["multipart/form-data"],
  body: {
    type: "object",
    properties: {
      files: { isFile: true, description: "Image file(s) to process in bulk" },
      type: {
        type: "object",
        description: "Document type, for structured field extraction (`ktp`, `ic`, `passport`, `struk`, `landing_page`).",
        properties: {
          value: { type: "string", enum: Object.keys(DOCUMENT_PARSERS) },
        },
      },
    },
    required: ["files"],
  },
  response: {
    200: {
      description: "Bulk extraction completed",
      type: "object",
      properties: {
        total: { type: "number", description: "Total files received" },
        successful: { type: "number", description: "Successfully processed files" },
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              filename: { type: "string" },
              text: { type: "string" },
              confidence: { type: "number" },
              type: { type: "string" },
              fields: { type: "object", additionalProperties: true },
              error: { type: "string" },
            },
          },
        },
      },
    },
    400: {
      description: "Invalid request parameters or missing files",
      type: "object",
      properties: { error: { type: "string" } },
    },
    401: {
      description: "Invalid or missing API key",
      type: "object",
      properties: { error: { type: "string" } },
    },
    500: {
      description: "Server error during processing",
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
        return reply.code(413).send({ error: "File exceeds 30MB limit" });
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

  fastify.post(
    "/ocr/bulk",
    {
      schema: bulkOcrSchema,
      preHandler: requireApiKey,
      config: { swaggerTransform },
    },
    async (request, reply) => {
      const rawFiles = request.body.files || request.body.file;
      const documentType = typeof request.body.type === "object" ? request.body.type?.value : request.body.type;

      if (!rawFiles) {
        return reply.code(400).send({ error: "No files provided in 'files' or 'file'" });
      }

      if (documentType && !DOCUMENT_PARSERS[documentType]) {
        return reply.code(400).send({ error: `Unsupported document type: ${documentType}` });
      }

      const files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
      const results = [];
      let successful = 0;

      for (const item of files) {
        const filename = item.filename || "image.jpg";
        if (!ALLOWED_MIME_TYPES.has(item.mimetype)) {
          results.push({
            filename,
            error: `Unsupported file type: ${item.mimetype}`,
          });
          continue;
        }

        const buffer = await item.toBuffer();
        if (buffer.length > MAX_FILE_SIZE_BYTES) {
          results.push({
            filename,
            error: "File exceeds 30MB limit",
          });
          continue;
        }

        try {
          const res = await recognizeText(buffer);
          let itemResult = { filename, ...res };
          if (documentType) {
            const fields = DOCUMENT_PARSERS[documentType](res.text);
            itemResult = { ...itemResult, type: documentType, fields };
          }
          results.push(itemResult);
          successful++;
        } catch (err) {
          results.push({
            filename,
            error: err.message || "Failed to process image",
          });
        }
      }

      return reply.send({
        total: files.length,
        successful,
        results,
      });
    }
  );
}
