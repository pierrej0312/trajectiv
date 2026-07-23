import { inject, Injectable } from '@angular/core';

import { AppContextStore } from '@core';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSessionService {
  private readonly keycloakStore = inject(KeycloakStore);
  private readonly appContextStore = inject(AppContextStore);
  private readonly workspaceStore = inject(WorkspaceStore);

  async logout(): Promise<void> {
    this.appContextStore.clear();
    this.workspaceStore.clearActiveWorkspace();

    await this.keycloakStore.logout();
  }
}
