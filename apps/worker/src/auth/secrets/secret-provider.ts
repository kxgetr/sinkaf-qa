export interface SecretProvider {
  getSecret(reference: string): Promise<string | null>;
}
