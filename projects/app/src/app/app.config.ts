import {
  ApplicationConfig,
  inject,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideTheme } from '@themes/theme.provider';
import { TrajectivTheme } from '@themes/trajectivTheme';
import { ThemeService } from '@themes/theme.service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { provideKeycloakAngular } from '@shared/module/keycloak/keycloak.provider';
import { environment } from '@app/src/environments/environment';

import { provideApi } from '@shared-api-client';
import { authDebugInterceptor } from './core/interceptors/authDebugInterceptor';
import { KeycloakSessionLifecycleService } from '@shared/module/keycloak/keycloak-session-lifecycle.service';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token-interceptor';

const localConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([refreshTokenInterceptor, includeBearerTokenInterceptor, authDebugInterceptor]),
    ),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
      }),
      withComponentInputBinding(),
    ),
    provideEnvironmentInitializer(() => {
      inject(KeycloakSessionLifecycleService);
      inject(ThemeService).init();
    }),
    provideKeycloakAngular({
      config: environment.keycloak.config,
      redirectUri: environment.keycloak.redirectUri,
      sessionTimeout: environment.keycloak.sessionTimeout,
    }),
    provideApi({
      basePath: environment.uri,
      withCredentials: false,
    }),
  ],
};

export const appConfig = mergeApplicationConfig(localConfig, provideTheme(TrajectivTheme));
