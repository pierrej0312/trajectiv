import type { AccessContext } from './access-context.model';
import type { AppRole } from './app-role.model';

export type AccessRequirement = {
  readonly requiredRoles?: readonly AppRole[];
  readonly requiredOrganization?: boolean;
};

export function canAccess(requirement: AccessRequirement, context: AccessContext): boolean {
  if (requirement.requiredOrganization && !context.activeOrganizationId) {
    return false;
  }

  if (!requirement.requiredRoles?.length) {
    return true;
  }

  return requirement.requiredRoles.some((role) => context.roles.includes(role));

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
}
