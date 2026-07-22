import { inject } from '@angular/core';

import type { CanActivateFn } from '@angular/router';

import Keycloak from 'keycloak-js';

import { KeycloakStore } from '../keycloak-store';

import { KeycloakUtil } from '../utils/keycloak.util';

export const authKeycloakGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(Keycloak);

  const keycloakStore = inject(KeycloakStore);

  await keycloakStore.sync();

  if (keycloak.authenticated) {
    return true;
  }

  const redirectUri = new URL(state.url, window.location.origin).toString();

  const loginUrl = await KeycloakUtil.buildLoginUrlWithTheme(keycloak, redirectUri);

  window.location.assign(loginUrl);

  return false;
};
