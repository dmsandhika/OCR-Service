import { createWorker } from "tesseract.js";

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng+msa");
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
