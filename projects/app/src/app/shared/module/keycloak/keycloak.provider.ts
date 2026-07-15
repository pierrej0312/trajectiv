import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';

import { environment } from '@app/src/environments/environment';

export interface KeycloakConfigOptions {
  url: string;
  realm: string;
  clientId: string;
}

export interface KeycloakOptions {
  config: KeycloakConfigOptions;
  redirectUri: string;
  sessionTimeout: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const backendBaseUrl = escapeRegExp(environment.uri.replace(/\/+$/, ''));

const backendBearerCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  bearerPrefix: 'Bearer',
  urlPattern: new RegExp(`^${backendBaseUrl}(?:/.*)?$`, 'i'),
});

export const provideKeycloakAngular = (options: KeycloakOptions) => {
  return provideKeycloak({
    config: options.config,

    initOptions: {
      onLoad: 'check-sso',

      silentCheckSsoRedirectUri: `${window.location.origin}/keycloak/silent-check-sso.html`,

      checkLoginIframe: false,
      redirectUri: options.redirectUri,
    },

    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'none',
        sessionTimeout: options.sessionTimeout,
      }),
    ],

    providers: [
      AutoRefreshTokenService,
      UserActivityService,

      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,

        useValue: [backendBearerCondition],
      },
    ],
  });
};
