import { getPlatformForKey } from "../config/apiKeys.js";

export async function requireApiKey(request, reply) {
  const key = request.headers["x-api-key"];
  const platform = key && getPlatformForKey(key);

  if (!platform) {
    return reply.code(401).send({ error: "Invalid or missing API key" });
  }

  request.platform = platform;
}
