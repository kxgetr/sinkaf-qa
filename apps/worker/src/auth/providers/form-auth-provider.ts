import { AuthProfile } from "../auth-profile";
import { AuthError, AuthErrorCodes } from "../auth-errors";
import { EnvSecretProvider } from "../secrets/env-secret-provider";
import { AuthRedactor } from "../auth-redactor";
import { PlaywrightBrowserAdapter } from "../../browser/playwright-browser-adapter";

export class FormAuthProvider {
  constructor(private secretProvider: EnvSecretProvider) {}

  async authenticate(profile: AuthProfile): Promise<any> {
    if (!profile.usernameSecretRef || !profile.passwordSecretRef) {
      throw new AuthError(AuthErrorCodes.SECRET_NOT_FOUND, "Username or password secret ref is missing.");
    }

    const username = await this.secretProvider.getSecret(profile.usernameSecretRef);
    const password = await this.secretProvider.getSecret(profile.passwordSecretRef);

    if (!username || !password) {
      throw new AuthError(AuthErrorCodes.SECRET_NOT_FOUND, "Could not resolve secrets from provider.");
    }

    AuthRedactor.registerSecret(username);
    AuthRedactor.registerSecret(password);

    const browser = new PlaywrightBrowserAdapter();
    await browser.open();
    
    try {
      await browser.navigate(profile.loginUrl);
      
      const snap = await browser.getStructuralSnapshot();
      const elements = snap.elements;

      // naive finding strategy
      const userField = elements.find((e: any) => 
        e.tag === "input" && 
        (profile.usernameFieldHints?.some(h => e.name?.toLowerCase().includes(h) || e.role?.toLowerCase().includes(h)))
      ) || elements.find((e: any) => e.tag === "input" && e.name?.toLowerCase().includes("email"));

      const passField = elements.find((e: any) => 
        e.tag === "input" && 
        (profile.passwordFieldHints?.some(h => e.name?.toLowerCase().includes(h) || e.role?.toLowerCase().includes(h)))
      ) || elements.find((e: any) => e.tag === "input" && e.name?.toLowerCase().includes("password"));

      const submitBtn = elements.find((e: any) => 
        (e.tag === "button" || e.tag === "input") && 
        profile.submitButtonHints?.some(h => e.text?.toLowerCase().includes(h) || e.name?.toLowerCase().includes(h))
      ) || elements.find((e: any) => e.tag === "button");

      if (!userField) throw new AuthError(AuthErrorCodes.USERNAME_FIELD_NOT_FOUND, "Username field not found");
      if (!passField) throw new AuthError(AuthErrorCodes.PASSWORD_FIELD_NOT_FOUND, "Password field not found");
      if (!submitBtn) throw new AuthError(AuthErrorCodes.SUBMIT_NOT_FOUND, "Submit button not found");

      await browser.fill(userField.id, username);
      await browser.fill(passField.id, password);
      await browser.click(submitBtn.id);

      // wait for navigation or dom changes
      await new Promise(r => setTimeout(r, 4000));

      const currentUrl = await browser.getCurrentUrl();
      if (profile.successUrlPattern && !currentUrl.includes(profile.successUrlPattern)) {
        throw new AuthError(AuthErrorCodes.VERIFICATION_FAILED, `URL did not match success pattern. Got: ${currentUrl}`);
      }

      const storageState = await browser.getStorageState();
      
      return storageState;
    } catch (e: any) {
      if (e instanceof AuthError) throw e;
      throw new AuthError(AuthErrorCodes.LOGIN_FAILED, e.message);
    } finally {
      await browser.close();
    }
  }
}
