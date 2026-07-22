import { MeWorkspaceApiDto } from '@shared-api-client';

import type { AccessRequirement } from '@core';

export const APP_ACCESS_REQUIREMENTS = {
  personalWorkspace: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Personal],
  },

  organizationWorkspace: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],
  },

  organizationAdministration: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredOrganizationRoles: [
      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationOwner,

      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationAdmin,
    ],
  },

  organizationRecruitment: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredOrganizationRoles: [
      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationOwner,

      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationAdmin,

      MeWorkspaceApiDto.OrganizationRoleEnum.Recruiter,
    ],
  },

  organizationCoaching: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredOrganizationRoles: [
      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationOwner,

      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationAdmin,

      MeWorkspaceApiDto.OrganizationRoleEnum.Coach,
    ],
  },

  organizationTraining: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredOrganizationRoles: [
      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationOwner,

      MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationAdmin,

      MeWorkspaceApiDto.OrganizationRoleEnum.Trainer,
    ],
  },

  memberRead: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredPermissions: [MeWorkspaceApiDto.PermissionsEnum.MemberRead],
  },

  memberInvite: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredPermissions: [MeWorkspaceApiDto.PermissionsEnum.MemberInvite],
  },

  memberManage: {
    requiredWorkspaceKinds: [MeWorkspaceApiDto.KindEnum.Organization],

    requiredPermissions: [MeWorkspaceApiDto.PermissionsEnum.MemberRead],
  },

  platformAdministration: {
    requiredRoles: ['app_admin'],
  },
} as const satisfies Readonly<Record<string, AccessRequirement>>;
