import { computed, effect, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import type { WorkspaceContext } from '@core';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'trajectiv-active-workspace-id';

type WorkspaceState = {
  readonly activeWorkspaceId: string;
};

const initialState: WorkspaceState = {
  activeWorkspaceId: 'personal',
};

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state, keycloakStore = inject(KeycloakStore)) => {
    const workspaces = computed(() => keycloakStore.accessContext().workspaces);

    const activeWorkspace = computed<WorkspaceContext | null>(() => {
      const availableWorkspaces = workspaces();

      return (
        availableWorkspaces.find((workspace) => workspace.id === state.activeWorkspaceId()) ??
        availableWorkspaces[0] ??
        null
      );
    });

    return {
      workspaces,
      activeWorkspace,

      isPersonalWorkspace: computed(() => activeWorkspace()?.kind === 'personal'),

      isOrganizationWorkspace: computed(() => activeWorkspace()?.kind === 'organization'),

      activeOrganizationId: computed(() => {
        const workspace = activeWorkspace();

        return workspace?.kind === 'organization' ? (workspace.organizationId ?? null) : null;
      }),

      organizationRole: computed(() => {
        const workspace = activeWorkspace();

        return workspace?.kind === 'organization' ? (workspace.organizationRole ?? null) : null;
      }),
    };
  }),

  withMethods((state) => ({
    setActiveWorkspace(workspaceId: string): void {
      patchState(state, {
        activeWorkspaceId: workspaceId,
      });

      globalThis.localStorage?.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
    },
  })),

  withHooks((store) => ({
    onInit(): void {
      const storedWorkspaceId = globalThis.localStorage?.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);

      if (storedWorkspaceId) {
        patchState(store, {
          activeWorkspaceId: storedWorkspaceId,
        });
      }

      effect(() => {
        const activeWorkspace = store.activeWorkspace();

        if (!activeWorkspace) {
          return;
        }

        if (store.activeWorkspaceId() === activeWorkspace.id) {
          return;
        }

        patchState(store, {
          activeWorkspaceId: activeWorkspace.id,
        });

        globalThis.localStorage?.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, activeWorkspace.id);
      });
    },
  })),
);
