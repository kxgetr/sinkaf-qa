import { SecretProvider } from "./secret-provider";

export class EnvSecretProvider implements SecretProvider {
  async getSecret(reference: string): Promise<string | null> {
    return process.env[reference] || null;
  }
}
