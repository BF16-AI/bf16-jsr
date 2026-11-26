# @bf16/sdk (Official TypeScript / JSR SDK)

Official zero-dependency TypeScript/Web Standard SDK for [bf16.ai](https://bf16.ai) on [JSR](https://jsr.io/@bf16/sdk) — uncensored 1M-context open-weight LLM inference API with strict Zero Data Retention (ZDR).

## Installation

```bash
deno add jsr:@bf16/sdk
# or npx jsr add @bf16/sdk
```

## Quickstart

```ts
import { Client, MODEL_DEEPSEEK_V41_FLASH } from "@bf16/sdk";

const client = new Client({ apiKey: Deno.env.get("BF16_API_KEY") });
const res = await client.chat(MODEL_DEEPSEEK_V41_FLASH, [
  { role: "user", content: "Summarize this diff concisely." },
]);
console.log(res);
```

## Links

- Website & Console: [bf16.ai](https://bf16.ai)
- API Documentation: [bf16.ai/docs](https://bf16.ai/docs)
- Open-Source Grants (`$50` API credits): [bf16.ai/open-source](https://bf16.ai/open-source)
