import { Bf16Error, Client, MODEL_DEEPSEEK_V41_FLASH } from "./mod.ts";

Deno.test("missing api key rejects authenticated requests", async () => {
  const client = new Client({});
  let caught = false;
  try {
    await client.me();
  } catch (err) {
    caught = err instanceof Bf16Error;
  }
  if (!caught) throw new Error("Expected Bf16Error");
});

Deno.test("models and chat roundtrip with mocked fetch", async () => {
  const client = new Client({
    apiKey: "sk-bf16-v1-test",
    fetchImpl: async (url) => {
      const target = String(url);
      if (target.endsWith("/models")) {
        return new Response(JSON.stringify({ object: "list", data: [{ id: MODEL_DEEPSEEK_V41_FLASH }] }), { status: 200 });
      }
      return new Response(
        JSON.stringify({ id: "chatcmpl-test", choices: [{ message: { content: "ok" } }] }),
        { status: 200 },
      );
    },
  });

  const models = await client.models();
  if (!Array.isArray(models.data) || models.data.length !== 1) {
    throw new Error("Expected 1 model");
  }
  const chat = await client.chat(MODEL_DEEPSEEK_V41_FLASH, [{ role: "user", content: "hi" }]);
  if (!chat.id) throw new Error("Expected chat completion response id");
});
