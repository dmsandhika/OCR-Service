export async function requireApiKey(request, reply) {
  const key = request.headers["x-api-key"];

  if (!key || key !== process.env.API_KEY) {
    return reply.code(401).send({ error: "Invalid or missing API key" });
  }
}
