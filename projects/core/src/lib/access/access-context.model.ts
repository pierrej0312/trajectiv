import type { AppRole } from './app-role.model';
import type { WorkspaceContext } from './workspace-context.model';

export type AccessContext = {
  readonly isAuthenticated: boolean;
  readonly roles: readonly AppRole[];
  readonly organizationIds: readonly string[];
  readonly activeOrganizationId: string | null;

  readonly workspaces: readonly WorkspaceContext[];
  readonly activeWorkspace: WorkspaceContext | null;
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
