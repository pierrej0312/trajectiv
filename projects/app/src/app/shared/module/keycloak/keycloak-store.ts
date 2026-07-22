import { computed, inject } from '@angular/core';

import { Router } from '@angular/router';

import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { withDevtools } from '@angular-architects/ngrx-toolkit';

import Keycloak, { type KeycloakProfile, type KeycloakTokenParsed } from 'keycloak-js';

import type { IdentityAccessContext } from '@core';

import { KeycloakUtil } from './utils/keycloak.util';

import { mapKeycloakTokenToIdentityContext } from './utils/keycloak-access-context.mapper';

type KeycloakState = {
  readonly user: KeycloakProfile | null;

  readonly tokenParsed: KeycloakTokenParsed | null;
};

type KeycloakGroupClaim = {
  readonly attributes?: Readonly<Record<string, unknown>>;
};

const initialState: KeycloakState = {
  user: null,
  tokenParsed: null,
};

export const KeycloakStore = signalStore(
  { providedIn: 'root' },

  withDevtools('keycloak'),

  withState(initialState),

  withComputed((store) => ({
    identityContext: computed<IdentityAccessContext>(() =>
      mapKeycloakTokenToIdentityContext(store.tokenParsed()),
    ),

    authenticated: computed(() => store.tokenParsed() !== null),

    displayName: computed(() => {
      const user = store.user();

      return user?.firstName ?? user?.username ?? null;
    }),
  })),

  withMethods((store, keycloak = inject(Keycloak), router = inject(Router)) => ({
    async login(): Promise<void> {
      const loginUrl = await KeycloakUtil.buildLoginUrlWithTheme(
        keycloak,
        getCurrentAppRedirectUri(router),
      );

      window.location.assign(loginUrl);
    },

    async logout(): Promise<void> {
      patchState(store, initialState);

      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    },

    async register(): Promise<void> {
      const registerUrl = await KeycloakUtil.buildRegisterUrlWithTheme(
        keycloak,
        getCurrentAppRedirectUri(router),
      );

      window.location.assign(registerUrl);
    },

    async sync(): Promise<void> {
      if (!keycloak.authenticated) {
        patchState(store, initialState);

        return;
      }

      const user = await keycloak.loadUserProfile();

      patchState(store, {
        user,
        tokenParsed: keycloak.tokenParsed ?? null,
      });
    },

    hasPlatformRole(role: string): boolean {
      return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
    },

    getGroupAttribute(attribute: string): readonly string[] {
      const rawGroups = store.tokenParsed()?.['groups'];

      if (!Array.isArray(rawGroups)) {
        return [];
      }

      return rawGroups.filter(isKeycloakGroupClaim).flatMap((group) => {
        const value = group.attributes?.[attribute];

        if (!Array.isArray(value)) {
          return [];
        }

        return value.filter((item): item is string => typeof item === 'string');
      });
    },
  })),
);
function isKeycloakGroupClaim(value: unknown): value is KeycloakGroupClaim {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const attributes = (value as Record<string, unknown>)['attributes'];

  return (
    attributes === undefined ||
    (typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes))
  );
}

function getCurrentAppRedirectUri(router: Router): string {
  const currentUrl = router.url;

  if (!currentUrl || currentUrl === '/' || currentUrl.includes('silent-check-sso')) {
    return window.location.origin;
  }

  return new URL(currentUrl, window.location.origin).toString();
}
