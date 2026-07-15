import { effect, inject, Injectable } from '@angular/core';

import Keycloak from 'keycloak-js';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class KeycloakSessionLifecycleService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakEvent = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const event = this.keycloakEvent();

      if (event.type !== KeycloakEventType.AuthRefreshError) {
        return;
      }

      void this.reauthenticate();
    });
  }

  private async reauthenticate(): Promise<void> {
    this.keycloak.clearToken();

    await this.keycloak.login({
      redirectUri: window.location.href,
    });
  }
}
