export class KeycloakUtil {
  static getResolvedTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  static async buildLoginUrlWithTheme(
    keycloak: {
      createLoginUrl: (options?: { redirectUri?: string }) => string | Promise<string>;
    },
    redirectUri: string,
  ): Promise<string> {
    const resolvedTheme = KeycloakUtil.getResolvedTheme();

    const loginUrl = await keycloak.createLoginUrl({
      redirectUri,
    });

    const url = new URL(loginUrl);
    url.searchParams.set('theme', resolvedTheme);

    return url.toString();
  }
  static async buildRegisterUrlWithTheme(
    keycloak: {
      createRegisterUrl: (options?: { redirectUri?: string }) => string | Promise<string>;
    },
    redirectUri: string,
  ): Promise<string> {
    const resolvedTheme = KeycloakUtil.getResolvedTheme();

    const registerUrl = await keycloak.createRegisterUrl({
      redirectUri,
    });

    const url = new URL(registerUrl);
    url.searchParams.set('theme', resolvedTheme);

    return url.toString();
  }
}
