import { recognizeText } from "../services/ocr.service.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/tiff",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default async function ocrRoutes(fastify) {
  fastify.post("/ocr", async (request, reply) => {
    const file = await request.file({
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    });

    if (!file) {
      return reply.code(400).send({ error: "No image file provided" });
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return reply.code(415).send({ error: `Unsupported file type: ${file.mimetype}` });
    }

    const buffer = await file.toBuffer();

    if (file.file.truncated) {
      return reply.code(413).send({ error: "File exceeds 10MB limit" });
    }

    try {
      const result = await recognizeText(buffer);
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "OCR processing failed");
      return reply.code(500).send({ error: "Failed to process image" });
    }
  });
}
