import { mkdirSync } from "node:fs";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

const CACHE_PATH = process.env.TESSDATA_CACHE_PATH || "./.cache/tesseract";

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    mkdirSync(CACHE_PATH, { recursive: true });
    workerPromise = createWorker("eng+ind+msa", 1, { cachePath: CACHE_PATH });
  }
  return workerPromise;
}

function deduplicateOverlap(text) {
  const lines = text.split("\n");
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed && result.length > 0 && result[result.length - 1].trim() === trimmed) {
      continue;
    }
    result.push(lines[i]);
  }
  return result.join("\n").trim();
}

export async function recognizeText(imageBuffer) {
  const worker = await getWorker();

  let metadata = null;
  try {
    metadata = await sharp(imageBuffer).metadata();
  } catch {
    metadata = null;
  }

  const SLICE_HEIGHT = 2000;
  const OVERLAP = 150;

  // Auto-slice tall images (such as full landing page screenshots) to preserve memory and accuracy
  if (
    metadata &&
    metadata.height &&
    metadata.width &&
    metadata.height > SLICE_HEIGHT * 1.25 &&
    metadata.height > metadata.width * 1.2
  ) {
    const totalHeight = metadata.height;
    const slices = [];
    let top = 0;

    while (top < totalHeight) {
      const height = Math.min(SLICE_HEIGHT, totalHeight - top);
      const sliceBuffer = await sharp(imageBuffer)
        .extract({ left: 0, top, width: metadata.width, height })
        .toBuffer();
      slices.push(sliceBuffer);

      if (top + height >= totalHeight) break;
      top += height - OVERLAP;
    }

    const texts = [];
    let totalConfidence = 0;

    for (const slice of slices) {
      const {
        data: { text, confidence },
      } = await worker.recognize(slice);
      if (text) {
        texts.push(text.trim());
      }
      totalConfidence += confidence;
    }

    const confidence = slices.length > 0 ? Math.round(totalConfidence / slices.length) : 0;
    return {
      text: deduplicateOverlap(texts.join("\n\n")),
      confidence,
    };
  }

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
