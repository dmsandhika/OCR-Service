import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import crypto from "node:crypto";

const CONFIG_PATH = process.env.API_KEYS_PATH || "./config/api-keys.json";
const platform = process.argv[2];

if (!platform) {
  console.error("Usage: npm run generate-key -- <platform-name>");
  process.exit(1);
}

const config = existsSync(CONFIG_PATH)
  ? JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
  : { keys: [] };

if (config.keys.some((entry) => entry.platform === platform)) {
  console.error(`Platform "${platform}" already has a key in ${CONFIG_PATH}`);
  process.exit(1);
}

const key = crypto.randomBytes(24).toString("hex");
config.keys.push({ key, platform });

mkdirSync(dirname(CONFIG_PATH), { recursive: true });
writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Added key for "${platform}" to ${CONFIG_PATH}:`);
console.log(key);
