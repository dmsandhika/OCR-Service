import { existsSync, readFileSync } from "node:fs";
import crypto from "node:crypto";

const CONFIG_PATH = process.env.API_KEYS_PATH || "./config/api-keys.json";

function loadKeys() {
  if (!existsSync(CONFIG_PATH)) {
    const tempKey = crypto.randomBytes(24).toString("hex");
    return { map: new Map([[tempKey, "temporary-dev"]]), generatedKey: tempKey };
  }

  const { keys } = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  return { map: new Map(keys.map(({ key, platform }) => [key, platform])), generatedKey: null };
}

const { map: apiKeysByKey, generatedKey } = loadKeys();

export { generatedKey };

export function getPlatformForKey(key) {
  return apiKeysByKey.get(key);
}
