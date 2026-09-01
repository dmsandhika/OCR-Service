import Fastify from "fastify";
import multipart from "@fastify/multipart";
import ocrRoutes from "./routes/ocr.route.js";
import { shutdownWorker } from "./services/ocr.service.js";

const fastify = Fastify({ logger: true });

await fastify.register(multipart);
await fastify.register(ocrRoutes);

fastify.get("/health", async () => ({ status: "ok" }));

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
