import { Anthropic } from "@anthropic-ai/sdk";
import { ApiStreamUsageChunk } from "./transform/stream.js";
import { ApiStream } from "./transform/stream.js";

export type ApiProvider = "anthropic";

export interface ApiHandlerOptions {
  taskId?: string;
  apiModelId?: string;
  apiKey?: string; // anthropic
  thinkingBudgetTokens?: number;
}

export type ApiConfiguration = ApiHandlerOptions & {
  apiProvider?: ApiProvider;
  favoritedModelIds?: string[];
};

export interface ApiHandler {
  createMessage(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[]
  ): ApiStream;
  getModel(): { id: string; info: ModelInfo };
  getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>;
}

// Models
interface PriceTier {
  tokenLimit: number; // Upper limit (inclusive) of *input* tokens for this price. Use Infinity for the highest tier.
  price: number; // Price per million tokens for this tier.
}

export interface ModelInfo {
  maxTokens?: number;
  contextWindow?: number;
  supportsImages?: boolean;
  supportsPromptCache: boolean; // this value is hardcoded for now
  inputPrice?: number; // Keep for non-tiered input models
  inputPriceTiers?: PriceTier[]; // Add for tiered input pricing
  outputPrice?: number; // Keep for non-tiered output models
  outputPriceTiers?: PriceTier[]; // Add for tiered output pricing
  thinkingConfig?: {
    maxBudget?: number; // Max allowed thinking budget tokens
    outputPrice?: number; // Output price per million tokens when budget > 0
    outputPriceTiers?: PriceTier[]; // Optional: Tiered output price when budget > 0
  };
  cacheWritesPrice?: number;
  cacheReadsPrice?: number;
  description?: string;
}

// Anthropic
// https://docs.anthropic.com/en/docs/about-claude/models // prices updated 2025-01-02
export type AnthropicModelId = keyof typeof anthropicModels;
export const anthropicDefaultModelId: AnthropicModelId =
  "claude-3-7-sonnet-20250219";

export const anthropicModels = {
  "claude-3-7-sonnet-20250219": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: true,

    supportsPromptCache: true,
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWritesPrice: 3.75,
    cacheReadsPrice: 0.3,
  },
  "claude-3-5-sonnet-20241022": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: true,

    supportsPromptCache: true,
    inputPrice: 3.0, // $3 per million input tokens
    outputPrice: 15.0, // $15 per million output tokens
    cacheWritesPrice: 3.75, // $3.75 per million tokens
    cacheReadsPrice: 0.3, // $0.30 per million tokens
  },
  "claude-3-5-haiku-20241022": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: false,
    supportsPromptCache: true,
    inputPrice: 0.8,
    outputPrice: 4.0,
    cacheWritesPrice: 1.0,
    cacheReadsPrice: 0.08,
  },
  "claude-3-opus-20240229": {
    maxTokens: 4096,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 15.0,
    outputPrice: 75.0,
    cacheWritesPrice: 18.75,
    cacheReadsPrice: 1.5,
  },
  "claude-3-haiku-20240307": {
    maxTokens: 4096,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 0.25,
    outputPrice: 1.25,
    cacheWritesPrice: 0.3,
    cacheReadsPrice: 0.03,
  },
} as const satisfies Record<string, ModelInfo>; // as const assertion makes the object deeply readonly
