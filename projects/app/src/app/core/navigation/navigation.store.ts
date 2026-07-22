import { computed, inject } from '@angular/core';

import { signalStore, withComputed } from '@ngrx/signals';

import {
  APP_NAVIGATION,
  canSeeNavItem,
  filterByPlacement,
  filterVisibleChildren,
  type AccessContext,
} from '@core';

import { MeWorkspaceApiDto } from '@shared-api-client';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';

export const NavigationStore = signalStore(
  { providedIn: 'root' },

  withComputed(
    (
      _,
      keycloakStore = inject(KeycloakStore),

      workspaceStore = inject(WorkspaceStore),
    ) => {
      const accessContext = computed<AccessContext>(() => {
        const identityContext = keycloakStore.identityContext();

        const activeWorkspace = workspaceStore.activeWorkspace();

        const isOrganizationWorkspace =
          activeWorkspace?.kind === MeWorkspaceApiDto.KindEnum.Organization;

        return {
          authenticated: identityContext.authenticated,

          platformRoles: identityContext.platformRoles,

          workspaces: workspaceStore.workspaces(),

          activeWorkspace: workspaceStore.activeWorkspace(),

          activeOrganizationId: workspaceStore.activeOrganizationId(),

          organizationRole: workspaceStore.organizationRole(),

          permissions: workspaceStore.activePermissions(),

          entitlements: workspaceStore.allowedFeatureKeys(),

          activeWorkspacePlan: workspaceStore.activePlan(),
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

      homeItem: computed(() => {
        const homeItems = store
          .visibleItems()
          .filter(
            (item) => item.workspaceHome && typeof item.route === 'string' && item.route.length > 0,
          );

        if (homeItems.length > 1) {
          console.warn(
            '[NavigationStore] Plusieurs pages d’accueil sont visibles.',
            homeItems.map((item) => item.id),
          );
        }

        return homeItems[0] ?? null;
      }),

      bottomBarItems: computed(() =>
        [...filterByPlacement(store.visibleItems(), 'bottom-bar')]
          .sort(
            (left, right) => (left.mobileOrder ?? left.order) - (right.mobileOrder ?? right.order),
          )
          .slice(0, 5),
      ),

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
