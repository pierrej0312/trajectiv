import { computed, inject } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';

import {
  APP_NAVIGATION,
  canSeeNavItem,
  filterByPlacement,
  filterVisibleChildren,
  type AccessContext,
} from '@core';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { WorkspaceStore } from '@shared/workspace/workspace.store';

export const NavigationStore = signalStore(
  { providedIn: 'root' },

  withComputed(
    (_, keycloakStore = inject(KeycloakStore), workspaceStore = inject(WorkspaceStore)) => {
      const accessContext = computed<AccessContext>(() => {
        const identityContext = keycloakStore.accessContext();

        const activeWorkspace = workspaceStore.activeWorkspace();

        const isOrganizationWorkspace = activeWorkspace?.kind === 'organization';

        return {
          ...identityContext,

          activeWorkspace,

          activeOrganizationId: isOrganizationWorkspace
            ? (activeWorkspace.organizationId ?? null)
            : null,

          organizationRole: isOrganizationWorkspace
            ? (activeWorkspace.organizationRole ?? null)
            : null,

          permissions: isOrganizationWorkspace
            ? (activeWorkspace.permissions ?? identityContext.permissions)
            : identityContext.permissions,

          entitlements: isOrganizationWorkspace
            ? (activeWorkspace.entitlements ?? identityContext.entitlements)
            : identityContext.entitlements,
        };
      });

      const visibleItems = computed(() => {
        const context = accessContext();

        return APP_NAVIGATION.filter((item) => canSeeNavItem(item, context))
          .map((item) => filterVisibleChildren(item, context))
          .sort((left, right) => left.order - right.order);
      });

      return {
        accessContext,
        visibleItems,
      };
    },
  ),

  withComputed((store) => {
    const sidebarItems = computed(() => filterByPlacement(store.visibleItems(), 'sidebar'));

    return {
      sidebarItems,

      bottomBarItems: computed(() => {
        return [...filterByPlacement(store.visibleItems(), 'bottom-bar')]
          .sort(
            (left, right) => (left.mobileOrder ?? left.order) - (right.mobileOrder ?? right.order),
          )
          .slice(0, 5);
      }),

      drawerItems: computed(() => filterByPlacement(store.visibleItems(), 'drawer')),

      profileMenuItems: computed(() => filterByPlacement(store.visibleItems(), 'profile-menu')),

      topNavigationItems: computed(() => filterByPlacement(store.visibleItems(), 'top-navigation')),

      mainSidebarItems: computed(() => sidebarItems().filter((item) => item.section === 'main')),

      organizationSidebarItems: computed(() =>
        sidebarItems().filter((item) => item.section === 'organization'),
      ),

      systemSidebarItems: computed(() =>
        sidebarItems().filter((item) => item.section === 'system'),
      ),

      adminSidebarItems: computed(() => sidebarItems().filter((item) => item.section === 'admin')),
    };
  }),
);
