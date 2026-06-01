import {
  ApplicationConfig,
  inject,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideTheme } from '@themes/theme.provider';
import { TrajectivTheme } from '@themes/trajectivTheme';
import { ThemeService } from '@themes/theme.service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { provideKeycloakAngular } from '@shared/module/keycloak/keycloak.provider';
import { environment } from '@core/src/environments/environment';

const localConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([includeBearerTokenInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideEnvironmentInitializer(() => {
      inject(ThemeService).init();
    }),
    provideKeycloakAngular({
      config: environment.keycloak.config,
      redirectUri: environment.keycloak.redirectUri,
      sessionTimeout: environment.keycloak.sessionTimeout,
    }),
  ],
};

export const appConfig = mergeApplicationConfig(localConfig, provideTheme(TrajectivTheme));
