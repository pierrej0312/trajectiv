import type { MeWorkspaceApiDto, WorkspacePlanApiDto } from '@shared-api-client';

import type { PlatformRole } from './app-role.model';

export type AccessContext = {
  readonly authenticated: boolean;

  readonly platformRoles: readonly PlatformRole[];

  readonly permissions: readonly MeWorkspaceApiDto.PermissionsEnum[];

  readonly entitlements: readonly string[];

  readonly workspaces: readonly MeWorkspaceApiDto[];

  readonly activeWorkspace: MeWorkspaceApiDto | null;

  readonly activeOrganizationId: string | null;

  readonly organizationRole: MeWorkspaceApiDto.OrganizationRoleEnum | null;

  readonly activeWorkspacePlan: WorkspacePlanApiDto | null;
};
