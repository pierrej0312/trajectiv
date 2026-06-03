import { CanActivateFn } from '@angular/router';
import Keycloak from 'keycloak-js';
import {inject} from '@angular/core'
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

export const authKeycloakGuard: CanActivateFn = async (route, state) => {
  const $keycloak = inject(Keycloak)
  const $store = inject(KeycloakStore)

  $store.sync();
  if ($keycloak.authenticated) {
    return true;
  }

  await $keycloak.login({
    redirectUri: window.location.origin + state.url
  });

  return false;
};
