import type { OrganizationRole } from './app-role.model';

export type WorkspaceKind = 'personal' | 'organization';

export type WorkspaceContext = {
  readonly id: string;
  readonly kind: WorkspaceKind;
  readonly label: string;

  readonly avatarUrl?: string;

  /**
   * Présent uniquement pour un workspace organisation.
   */
  readonly organizationId?: string;

  /**
   * Rôle de l’utilisateur dans cette organisation.
   */
  readonly organizationRole?: OrganizationRole;

  /**
   * Permissions calculées pour cette organisation.
   */
  readonly permissions?: readonly string[];

  /**
   * Fonctionnalités activées pour cette organisation.
   */
  readonly entitlements?: readonly string[];
};
