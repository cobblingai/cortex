import { safeStorage } from "electron";
import fs from "fs";
import path from "path";
import { app } from "electron";

class ConfigManager {
  private configPath: string;

  constructor() {
    // Store in user data directory which is secure and specific to the app
    this.configPath = path.join(app.getPath("userData"), "secure-config.enc");
  }

  private async loadEncryptedConfig(): Promise<Record<string, string>> {
    try {
      if (!fs.existsSync(this.configPath)) {
        return {};
      }

      const encryptedData = await fs.promises.readFile(this.configPath);
      if (encryptedData.length === 0) {
        return {};
      }

      const decryptedData = safeStorage.decryptString(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Error loading config:", error);
      return {};
    }
  }

  private async saveEncryptedConfig(
    config: Record<string, string>
  ): Promise<void> {
    try {
      const configStr = JSON.stringify(config);
      const encryptedData = safeStorage.encryptString(configStr);
      await fs.promises.writeFile(this.configPath, encryptedData);
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  }

  async setApiKey(
    service: "openai" | "anthropic",
    apiKey: string
  ): Promise<void> {
    const config = await this.loadEncryptedConfig();
    config[`${service}_api_key`] = apiKey;
    await this.saveEncryptedConfig(config);
  }

  async getApiKey(service: "openai" | "anthropic"): Promise<string | null> {
    const config = await this.loadEncryptedConfig();
    return config[`${service}_api_key`] || null;
  }

  async removeApiKey(service: "openai" | "anthropic"): Promise<void> {
    const config = await this.loadEncryptedConfig();
    delete config[`${service}_api_key`];
    await this.saveEncryptedConfig(config);
  }
}

export const configManager = new ConfigManager();
