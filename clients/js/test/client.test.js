import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OcrClient, OcrError } from "../src/index.js";

describe("JS OcrClient", () => {
  it("should throw if baseUrl or apiKey is missing", () => {
    assert.throws(() => new OcrClient({}), /baseUrl/);
    assert.throws(() => new OcrClient({ baseUrl: "http://localhost:3000" }), /apiKey/);
  });

  it("should perform health check successfully", async () => {
    const mockFetch = async (url) => {
      assert.equal(url, "http://localhost:3000/health");
      return {
        ok: true,
        status: 200,
        json: async () => ({ status: "ok" }),
      };
    };

    const client = new OcrClient({
      baseUrl: "http://localhost:3000",
      apiKey: "secret-key",
      fetch: mockFetch,
    });

    const res = await client.health();
    assert.deepEqual(res, { status: "ok" });
  });

  it("should send multipart scan request with correct headers", async () => {
    let capturedUrl;
    let capturedHeaders;
    let capturedBody;

    const mockFetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedBody = options.body;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          text: "Sample text",
          confidence: 95,
          type: "ktp",
          fields: { nik: "3171012304950001" },
        }),
      };
    };

    const client = new OcrClient({
      baseUrl: "http://localhost:3000",
      apiKey: "secret-key",
      fetch: mockFetch,
    });

    const dummyBuffer = Buffer.from("fake-image-bytes");
    const result = await client.scan(dummyBuffer, { type: "ktp" });

    assert.equal(capturedUrl, "http://localhost:3000/ocr");
    assert.equal(capturedHeaders["x-api-key"], "secret-key");
    assert.ok(capturedBody instanceof FormData);
    assert.equal(result.fields.nik, "3171012304950001");
  });

  it("should throw OcrError when server returns an error status", async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid API key" }),
    });

    const client = new OcrClient({
      baseUrl: "http://localhost:3000",
      apiKey: "bad-key",
      fetch: mockFetch,
    });

    await assert.rejects(
      async () => client.scan(Buffer.from("abc")),
      (err) => err instanceof OcrError && err.statusCode === 401 && err.message === "Invalid API key"
    );
  });
});
