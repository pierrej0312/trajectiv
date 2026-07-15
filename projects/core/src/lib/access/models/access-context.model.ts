import type { OrganizationRole, PlatformRole } from './app-role.model';

import type { WorkspaceContext } from './workspace-context.model';

export type AccessContext = {
  readonly authenticated: boolean;

  /**
   * Rôles globaux venant de l’identité Keycloak.
   */
  readonly platformRoles: readonly PlatformRole[];

  /**
   * Permissions effectives du contexte actif.
   */
  readonly permissions: readonly string[];

  /**
   * Entitlements effectifs du contexte actif.
   */
  readonly entitlements: readonly string[];

  /**
   * Tous les workspaces accessibles.
   */
  readonly workspaces: readonly WorkspaceContext[];

  /**
   * Workspace personnel ou organisation actuellement sélectionné.
   */
  readonly activeWorkspace: WorkspaceContext | null;

  readonly activeOrganizationId: string | null;

  readonly organizationRole: OrganizationRole | null;
};

/* TODO
  export type OrganizationContext = {
    readonly id: string;
    readonly name: string;
    readonly roles: readonly AppRole[];
    readonly plan?: 'free' | 'pro' | 'enterprise';
  };

  export type AccessContext = {
    readonly isAuthenticated: boolean;
    readonly roles: readonly AppRole[];
    readonly organizations: readonly OrganizationContext[];
    readonly activeOrganizationId: string | null;
  };
*/
