import type { AccessRequirement } from '@core';

export const APP_ACCESS_REQUIREMENTS = {
  /**
   * Fonctionnalités utilisables depuis le workspace personnel.
   */
  personalWorkspace: {
    requiredWorkspaceKinds: ['personal'],
  },

  /**
   * Fonctionnalités générales d’un workspace organisation.
   */
  organizationWorkspace: {
    requiredWorkspaceKinds: ['organization'],
  },

  /**
   * Administration d’une organisation.
   */
  organizationAdministration: {
    requiredWorkspaceKinds: ['organization'],

    requiredOrganizationRoles: ['organization_owner', 'organization_admin'],
  },

  /**
   * Espace recrutement d’une organisation.
   */
  organizationRecruitment: {
    requiredWorkspaceKinds: ['organization'],

    requiredOrganizationRoles: ['organization_owner', 'organization_admin', 'recruiter'],
  },

  /**
   * Espace coaching.
   */
  organizationCoaching: {
    requiredWorkspaceKinds: ['organization'],

    requiredOrganizationRoles: ['organization_owner', 'organization_admin', 'coach'],
  },

  /**
   * Espace formation.
   */
  organizationTraining: {
    requiredWorkspaceKinds: ['organization'],

    requiredOrganizationRoles: ['organization_owner', 'organization_admin', 'trainer'],
  },

  /**
   * Administration globale de Trajectiv.
   */
  platformAdministration: {
    requiredRoles: ['app_admin'],
  },
} as const satisfies Readonly<Record<string, AccessRequirement>>;
