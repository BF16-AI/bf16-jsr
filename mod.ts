/**
 * Official TypeScript/Deno/Web Standard SDK for bf16.ai (https://bf16.ai).
 * Uncensored 1M-context open-weight LLM API with strict Zero Data Retention.
 * @module
 */

export const DEFAULT_BASE_URL = "https://api.bf16.ai/v1";
export const ANTHROPIC_BASE_URL = "https://api.bf16.ai";

export const MODEL_DEEPSEEK_V41_FLASH = "deepseek/deepseek-v4.1-flash-uncensored";
export const MODEL_DEEPSEEK_V41_FLASH_FAST = "deepseek/deepseek-v4.1-flash-uncensored-fast";
export const MODEL_GLM_53_FLASH = "zai-org/glm-5.3-flash-uncensored";
export const MODEL_GLM_53 = "zai-org/glm-5.3-uncensored";
export const MODEL_KIMI_K31_PRO = "moonshotai/kimi-k3.1-pro-uncensored";
export const MODEL_AUTO = "bf16/auto";

export class Bf16Error extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "Bf16Error";
    this.statusCode = statusCode;
  }
}

export interface ChatMessage {
  role: "system" | "developer" | "user" | "assistant" | "tool";
  content: string;
}

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function readEnvKey(): string | undefined {
  try {
    const deno = (globalThis as { Deno?: { env?: { get(k: string): string | undefined } } }).Deno;
    return deno?.env?.get("BF16_API_KEY");
  } catch {
    return undefined;
  }
}

export class Client {
  readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.apiKey = options.apiKey !== undefined ? options.apiKey : readEnvKey();
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** List live active bf16.ai models and per-1M pricing. */
  async models(): Promise<Record<string, unknown>> {
    return await this.requestJson("GET", "/models", undefined, false);
  }

  /** Inspect authenticated balance and rate-limit tier (/v1/me). */
  async me(): Promise<Record<string, unknown>> {
    return await this.requestJson("GET", "/me", undefined, true);
  }

  /** Run an OpenAI-compatible chat completion on /v1/chat/completions. */
  async chat(
    model: string,
    messages: ChatMessage[],
    options: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return await this.requestJson(
      "POST",
      "/chat/completions",
      { ...options, model, messages },
      true,
    );
  }

  private async requestJson(
    method: string,
    path: string,
    payload: Record<string, unknown> | undefined,
    requireAuth: boolean,
  ): Promise<Record<string, unknown>> {
    if (requireAuth && !this.apiKey) {
      throw new Bf16Error("Missing BF16_API_KEY");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    if (payload) {
      headers["Content-Type"] = "application/json";
    }

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const text = await res.text();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      parsed = { raw: text };
    }
    if (!res.ok) {
      throw new Bf16Error(`bf16.ai HTTP ${res.status}: ${text}`, res.status);
    }
    return parsed;
  }
}
