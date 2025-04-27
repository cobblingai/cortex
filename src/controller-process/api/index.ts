import { ApiConfiguration, ApiHandler } from "@/types/api/index.js";
import { AnthropicHandler } from "./providers/anthropic.js";

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
  const { apiProvider, ...options } = configuration;
  switch (apiProvider) {
    case "anthropic":
      return new AnthropicHandler(options);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
}
