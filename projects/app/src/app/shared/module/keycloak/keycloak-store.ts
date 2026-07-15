import { computed, inject } from '@angular/core';

import { Router } from '@angular/router';

import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { withDevtools } from '@angular-architects/ngrx-toolkit';

import Keycloak, { type KeycloakProfile, type KeycloakTokenParsed } from 'keycloak-js';

import type { AccessContext } from '@core';

import { KeycloakUtil } from '@shared/module/keycloak/utils/keycloak.util';

import { mapKeycloakTokenToAccessContext } from '@shared/module/keycloak/utils/keycloak-access-context.mapper';

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

  return `${window.location.origin}${currentUrl}`;
}

export const KeycloakStore = signalStore(
  { providedIn: 'root' },

  withDevtools('keycloak'),

  withState(initialState),

  withComputed((state) => ({
    accessContext: computed<AccessContext>(() =>
      mapKeycloakTokenToAccessContext(state.tokenParsed()),
    ),

    authenticated: computed(() => state.tokenParsed() !== null),
  })),

  withMethods((state, keycloak = inject(Keycloak), router = inject(Router)) => ({
    async login(): Promise<void> {
      const loginUrl = await KeycloakUtil.buildLoginUrlWithTheme(
        keycloak,
        getCurrentAppRedirectUri(router),
      );

      window.location.href = loginUrl;
    },

    async logout(): Promise<void> {
      patchState(state, {
        user: null,
        tokenParsed: null,
      });

      await keycloak.logout({
        redirectUri: getCurrentAppRedirectUri(router),
      });
    },

    async register(): Promise<void> {
      const registerUrl = await KeycloakUtil.buildRegisterUrlWithTheme(
        keycloak,
        getCurrentAppRedirectUri(router),
      );

      window.location.href = registerUrl;
    },

    async sync(): Promise<void> {
      if (!keycloak.authenticated) {
        patchState(state, {
          user: null,
          tokenParsed: null,
        });

        return;
      }

      const user = await keycloak.loadUserProfile();

      patchState(state, {
        tokenParsed: keycloak.tokenParsed ?? null,

        user,
      });
    },

    hasRole(role: string): boolean {
      return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
    },

    getGroupAttribute(attribute: string): string[] {
      const rawGroups = state.tokenParsed()?.['groups'];

      if (!Array.isArray(rawGroups)) {
        return [];
      }

      return rawGroups.filter(isKeycloakGroupClaim).flatMap((group) => {
        const attributeValue = group.attributes?.[attribute];

        if (!Array.isArray(attributeValue)) {
          return [];
        }

        return attributeValue.filter((value): value is string => typeof value === 'string');
      });
    },
  })),
);
