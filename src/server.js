import "dotenv/config";
import crypto from "node:crypto";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import ocrRoutes from "./routes/ocr.route.js";
import { shutdownWorker } from "./services/ocr.service.js";

const fastify = Fastify({
  logger: true,
  ajv: { plugins: [multipart.ajvFilePlugin] },
});

if (!process.env.API_KEY) {
  process.env.API_KEY = crypto.randomBytes(24).toString("hex");
  fastify.log.warn(
    `API_KEY not set in environment — generated a temporary one for this run only: ${process.env.API_KEY}`
  );
}

await fastify.register(multipart, {
  attachFieldsToBody: true,
  limits: { fileSize: 10 * 1024 * 1024 },
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: "OCR Service API",
      description: "OCR service powered by Tesseract.js, usable across multiple platforms.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        apiKey: { type: "apiKey", name: "x-api-key", in: "header" },
      },
    },
  },
});
await fastify.register(swaggerUi, { routePrefix: "/docs" });

await fastify.register(ocrRoutes);

fastify.get(
  "/health",
  { schema: { tags: ["Health"], summary: "Health check" } },
  async () => ({ status: "ok" })
);

const port = process.env.PORT || 3000;

async function start() {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

async function shutdown() {
  await shutdownWorker();
  await fastify.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
