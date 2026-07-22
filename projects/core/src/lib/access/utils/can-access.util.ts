import type { MeWorkspaceApiDto } from '@shared-api-client';

import type { PlatformRole } from '../models/app-role.model';

import type { AccessContext } from '../models/access-context.model';

export type AccessRequirement = {
  /**
   * Au moins un rôle plateforme doit correspondre.
   */
  readonly requiredRoles?: readonly PlatformRole[];

  /**
   * Toutes les permissions doivent être présentes.
   */
  readonly requiredPermissions?: readonly MeWorkspaceApiDto.PermissionsEnum[];

  /**
   * Tous les entitlements doivent être présents.
   */
  readonly requiredEntitlements?: readonly string[];

  /**
   * Le workspace actif doit correspondre.
   */
  readonly requiredWorkspaceKinds?: readonly MeWorkspaceApiDto.KindEnum[];

  /**
   * Au moins un rôle organisationnel doit correspondre.
   */
  readonly requiredOrganizationRoles?: readonly MeWorkspaceApiDto.OrganizationRoleEnum[];
};

export function canAccess(requirement: AccessRequirement, context: AccessContext): boolean {
  if (!context.authenticated) {
    return false;
  }

  if (
    requirement.requiredWorkspaceKinds?.length &&
    !matchesWorkspaceKind(requirement.requiredWorkspaceKinds, context)
  ) {
    return false;
  }

  if (
    requirement.requiredRoles?.length &&
    !hasAnyValue(context.platformRoles, requirement.requiredRoles)
  ) {
    return false;
  }

  if (
    requirement.requiredPermissions?.length &&
    !hasEveryValue(context.permissions, requirement.requiredPermissions)
  ) {
    return false;
  }

  if (
    requirement.requiredEntitlements?.length &&
    !hasEveryValue(context.entitlements, requirement.requiredEntitlements)
  ) {
    return false;
  }

  if (
    requirement.requiredOrganizationRoles?.length &&
    !matchesOrganizationRole(requirement.requiredOrganizationRoles, context)
  ) {
    return false;
  }

  return true;
}

function matchesWorkspaceKind(
  requiredKinds: readonly MeWorkspaceApiDto.KindEnum[],
  context: AccessContext,
): boolean {
  const kind = context.activeWorkspace?.kind;

  return !!kind && requiredKinds.includes(kind);
}

function matchesOrganizationRole(
  requiredRoles: readonly MeWorkspaceApiDto.OrganizationRoleEnum[],
  context: AccessContext,
): boolean {
  return (
    context.activeOrganizationId !== null &&
    context.organizationRole !== null &&
    requiredRoles.includes(context.organizationRole)
  );
}

function hasAnyValue<T>(availableValues: readonly T[], requiredValues: readonly T[]): boolean {
  return requiredValues.some((requiredValue) => availableValues.includes(requiredValue));
}

function hasEveryValue<T>(availableValues: readonly T[], requiredValues: readonly T[]): boolean {
  return requiredValues.every((requiredValue) => availableValues.includes(requiredValue));
}

/* TODO
  requiredAnyRole
  requiredAllRoles
  requiredPermissions
  requiredPlan

  export function hasOrganization(context: AccessContext): boolean {
    return context.organizationIds.length > 0;
  }

  export function isOrganizationOwner(context: AccessContext): boolean {
    return context.roles.includes('organization_owner');
  }
   */
