import { inject } from '@angular/core';

import type { CanActivateFn } from '@angular/router';

import Keycloak from 'keycloak-js';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

import { KeycloakUtil } from '@shared/module/keycloak/utils/keycloak.util';

export const authKeycloakGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(Keycloak);
  const keycloakStore = inject(KeycloakStore);

  await keycloakStore.sync();

  if (keycloak.authenticated) {
    return true;
  }

  const loginUrl = await KeycloakUtil.buildLoginUrlWithTheme(
    keycloak,
    `${window.location.origin}${state.url}`,
  );

  window.location.href = loginUrl;

  return false;
};
