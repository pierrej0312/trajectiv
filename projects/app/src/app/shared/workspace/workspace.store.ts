import { computed, effect, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import type { WorkspaceContext } from '@core';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'trajectiv-active-workspace-id';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },

  withState({
    activeWorkspaceId: localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY) ?? 'personal',
  }),

  withComputed((state, keycloakStore = inject(KeycloakStore)) => ({
    workspaces: computed(() => keycloakStore.accessContext().workspaces),

    activeWorkspace: computed<WorkspaceContext | null>(() => {
      const workspaces = keycloakStore.accessContext().workspaces;

      return (
        workspaces.find((workspace) => workspace.id === state.activeWorkspaceId()) ??
        workspaces[0] ??
        null
      );
    }),

    isPersonalWorkspace: computed(() => {
      return (
        keycloakStore
          .accessContext()
          .workspaces.find((workspace) => workspace.id === state.activeWorkspaceId())?.kind ===
        'personal'
      );
    }),

    isOrganizationWorkspace: computed(() => {
      return (
        keycloakStore
          .accessContext()
          .workspaces.find((workspace) => workspace.id === state.activeWorkspaceId())?.kind ===
        'organization'
      );
    }),
  })),

  withMethods((state) => ({
    setActiveWorkspace: (workspaceId: string) => {
      patchState(state, {
        activeWorkspaceId: workspaceId,
      });

      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
    },
  })),
);
