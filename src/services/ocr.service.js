import { mkdirSync } from "node:fs";
import { createWorker } from "tesseract.js";

const CACHE_PATH = process.env.TESSDATA_CACHE_PATH || "./.cache/tesseract";

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    mkdirSync(CACHE_PATH, { recursive: true });
    workerPromise = createWorker("eng+msa", 1, { cachePath: CACHE_PATH });
  }
  return workerPromise;
}

export async function recognizeText(imageBuffer) {
  const worker = await getWorker();
  const {
    data: { text, confidence },
  } = await worker.recognize(imageBuffer);
  return { text: text.trim(), confidence };
}

export async function shutdownWorker() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
