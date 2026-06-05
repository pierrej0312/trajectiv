import { computed, Injectable, inject } from '@angular/core';

import { APP_NAVIGATION, canSeeNavChildItem, canSeeNavItem, type AppNavItem } from '@core';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { WorkspaceStore } from '@shared/workspace/workspace.store';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly keycloakStore = inject(KeycloakStore);
  private readonly workspaceStore = inject(WorkspaceStore);

  readonly accessContext = computed(() => {
    const context = this.keycloakStore.accessContext();
    const activeWorkspace = this.workspaceStore.activeWorkspace();

    return {
      ...context,
      activeOrganizationId:
        activeWorkspace?.kind === 'organization' ? (activeWorkspace.organizationId ?? null) : null,
      activeWorkspace,
    };
  });

  readonly items = computed(() =>
    APP_NAVIGATION.filter((item) => canSeeNavItem(item, this.accessContext())).map((item) =>
      this.filterChildren(item),
    ),
  );

  readonly desktopItems = computed(() => this.items().filter((item) => item.desktop !== false));

  readonly mobileItems = computed(() => this.items().filter((item) => item.mobile === true));

  readonly drawerItems = computed(() => this.items().filter((item) => item.drawer === true));

  readonly mainDesktopItems = computed(() =>
    this.desktopItems().filter((item) => item.section === 'main'),
  );

  readonly systemDesktopItems = computed(() =>
    this.desktopItems().filter((item) => item.section === 'system'),
  );

  private filterChildren(item: AppNavItem): AppNavItem {
    const children = item.children?.filter((child) =>
      canSeeNavChildItem(child, this.accessContext()),
    );

    return {
      ...item,
      children,
    };
  }
}
