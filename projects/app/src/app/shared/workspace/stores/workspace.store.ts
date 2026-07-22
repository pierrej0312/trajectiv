import { computed, effect, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import {
  EffectiveEntitlementApiDto,
  MeWorkspaceApiDto,
  WorkspacePlanApiDto,
} from '@shared-api-client';

import { AppContextStore } from '@core';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'trajectiv-active-workspace-id';

type WorkspaceState = {
  readonly activeWorkspaceId: string | null;
};

const initialState: WorkspaceState = {
  activeWorkspaceId: null,
};

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store, appContext = inject(AppContextStore)) => {
    /**
     * Seuls les workspaces possédant un identifiant
     * peuvent être sélectionnés.
     */
    const workspaces = computed<readonly MeWorkspaceApiDto[]>(() =>
      appContext.workspaces().filter(hasWorkspaceId),
    );

    /**
     * Workspace personnel utilisé comme fallback
     * quand aucune sélection valide n'existe.
     */
    const personalWorkspace = computed<MeWorkspaceApiDto | null>(
      () =>
        workspaces().find((workspace) => workspace.kind === MeWorkspaceApiDto.KindEnum.Personal) ??
        null,
    );

    /**
     * Workspace réellement actif.
     *
     * Ordre de résolution :
     * 1. workspace sélectionné encore accessible ;
     * 2. workspace personnel ;
     * 3. premier workspace disponible ;
     * 4. null.
     */
    const activeWorkspace = computed<MeWorkspaceApiDto | null>(() => {
      const availableWorkspaces = workspaces();

      const activeWorkspaceId = store.activeWorkspaceId();

      if (activeWorkspaceId) {
        const selectedWorkspace = availableWorkspaces.find(
          (workspace) => workspace.id === activeWorkspaceId,
        );

        if (selectedWorkspace) {
          return selectedWorkspace;
        }
      }

      return personalWorkspace() ?? availableWorkspaces[0] ?? null;
    });

    const activePermissions = computed<readonly MeWorkspaceApiDto.PermissionsEnum[]>(() =>
      normalizePermissions(activeWorkspace()?.permissions),
    );

    const activeEntitlements = computed<readonly EffectiveEntitlementApiDto[]>(() =>
      normalizeEntitlements(activeWorkspace()?.entitlements),
    );

    const allowedFeatureKeys = computed<readonly string[]>(() =>
      extractAllowedFeatureKeys(activeEntitlements()),
    );

    const entitlementsByFeatureKey = computed<ReadonlyMap<string, EffectiveEntitlementApiDto>>(
      () => {
        const entries = activeEntitlements().flatMap((entitlement) => {
          const featureKey = entitlement.featureKey?.trim();

          return featureKey ? [[featureKey, entitlement] as const] : [];
        });

        return new Map(entries);
      },
    );

    const isOrganizationWorkspace = computed(
      () => activeWorkspace()?.kind === MeWorkspaceApiDto.KindEnum.Organization,
    );

    return {
      workspaces,
      personalWorkspace,
      activeWorkspace,

      isPersonalWorkspace: computed(
        () => activeWorkspace()?.kind === MeWorkspaceApiDto.KindEnum.Personal,
      ),

      isOrganizationWorkspace,

      activeOrganizationId: computed<string | null>(() => {
        if (!isOrganizationWorkspace()) {
          return null;
        }

        return activeWorkspace()?.organizationId ?? null;
      }),

      organizationRole: computed<MeWorkspaceApiDto.OrganizationRoleEnum | null>(() => {
        if (!isOrganizationWorkspace()) {
          return null;
        }

        return activeWorkspace()?.organizationRole ?? null;
      }),

      activePlan: computed<WorkspacePlanApiDto | null>(() => activeWorkspace()?.plan ?? null),

      activePermissions,
      activeEntitlements,
      allowedFeatureKeys,
      entitlementsByFeatureKey,

      hasWorkspaces: computed(() => workspaces().length > 0),

      hasOrganizationWorkspaces: computed(() =>
        workspaces().some(
          (workspace) => workspace.kind === MeWorkspaceApiDto.KindEnum.Organization,
        ),
      ),
    };
  }),

  withMethods((store) => ({
    /**
     * Sélectionne un workspace accessible.
     *
     * Retourne false si l'identifiant ne correspond
     * à aucun workspace actuellement disponible.
     */
    setActiveWorkspace(workspaceId: string): boolean {
      const normalizedWorkspaceId = workspaceId.trim();

      if (!normalizedWorkspaceId) {
        return false;
      }

      const workspaceExists = store
        .workspaces()
        .some((workspace) => workspace.id === normalizedWorkspaceId);

      if (!workspaceExists) {
        return false;
      }

      patchState(store, {
        activeWorkspaceId: normalizedWorkspaceId,
      });

      return true;
    },

    /**
     * Revient au workspace personnel.
     */
    selectPersonalWorkspace(): boolean {
      const personalWorkspace = store.personalWorkspace();

      if (!personalWorkspace?.id) {
        return false;
      }

      patchState(store, {
        activeWorkspaceId: personalWorkspace.id,
      });

      return true;
    },

    /**
     * Supprime la sélection manuelle.
     *
     * Le computed activeWorkspace retombera
     * automatiquement sur le workspace personnel.
     */
    clearActiveWorkspace(): void {
      patchState(store, {
        activeWorkspaceId: null,
      });
    },

    hasPermission(permission: MeWorkspaceApiDto.PermissionsEnum): boolean {
      return store.activePermissions().includes(permission);
    },

    hasFeature(featureKey: string): boolean {
      const normalizedFeatureKey = featureKey.trim();

      return (
        normalizedFeatureKey.length > 0 && store.allowedFeatureKeys().includes(normalizedFeatureKey)
      );
    },

    getEntitlement(featureKey: string): EffectiveEntitlementApiDto | null {
      const normalizedFeatureKey = featureKey.trim();

      if (!normalizedFeatureKey) {
        return null;
      }

      return store.entitlementsByFeatureKey().get(normalizedFeatureKey) ?? null;
    },
  })),

  withHooks((store) => ({
    onInit(): void {
      const storedWorkspaceId = readStoredWorkspaceId();

      if (storedWorkspaceId) {
        patchState(store, {
          activeWorkspaceId: storedWorkspaceId,
        });
      }

      /**
       * L'effet ne sert qu'à synchroniser la sélection
       * valide vers localStorage.
       *
       * Il ne propage pas d'état dérivé entre signals.
       */
      effect(() => {
        const activeWorkspaceId = store.activeWorkspace()?.id;

        if (!activeWorkspaceId) {
          removeStoredWorkspaceId();

          return;
        }

        writeStoredWorkspaceId(activeWorkspaceId);
      });
    },
  })),
);

function hasWorkspaceId(workspace: MeWorkspaceApiDto): workspace is MeWorkspaceApiDto & {
  readonly id: string;
} {
  return typeof workspace.id === 'string' && workspace.id.trim().length > 0;
}

function normalizePermissions(
  permissions:
    | Set<MeWorkspaceApiDto.PermissionsEnum>
    | readonly MeWorkspaceApiDto.PermissionsEnum[]
    | undefined,
): readonly MeWorkspaceApiDto.PermissionsEnum[] {
  if (!permissions) {
    return [];
  }

  const values = permissions instanceof Set ? [...permissions] : permissions;

  return [...new Set(values)];
}

function normalizeEntitlements(
  entitlements: Set<EffectiveEntitlementApiDto> | readonly EffectiveEntitlementApiDto[] | undefined,
): readonly EffectiveEntitlementApiDto[] {
  if (!entitlements) {
    return [];
  }

  return entitlements instanceof Set ? [...entitlements] : entitlements;
}

function extractAllowedFeatureKeys(
  entitlements: readonly EffectiveEntitlementApiDto[],
): readonly string[] {
  const featureKeys = entitlements.flatMap((entitlement) => {
    const featureKey = entitlement.featureKey?.trim();

    if (!featureKey || entitlement.allowed !== true) {
      return [];
    }

    return [featureKey];
  });

  return [...new Set(featureKeys)];
}

function readStoredWorkspaceId(): string | null {
  try {
    const value = globalThis.localStorage?.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);

    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : null;
  } catch {
    return null;
  }
}

function writeStoredWorkspaceId(workspaceId: string): void {
  try {
    globalThis.localStorage?.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
  } catch {
    // Le stockage local est optionnel.
  }
}

function removeStoredWorkspaceId(): void {
  try {
    globalThis.localStorage?.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  } catch {
    // Le stockage local est optionnel.
  }
}
