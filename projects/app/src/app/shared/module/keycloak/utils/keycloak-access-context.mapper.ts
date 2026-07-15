import { environment } from '@app/src/environments/environment';

import type { AccessContext, OrganizationRole, PlatformRole, WorkspaceContext } from '@core';

const PLATFORM_ROLES = new Set<PlatformRole>(['app_user', 'app_admin']);

const ORGANIZATION_ROLES = new Set<OrganizationRole>([
  'organization_owner',
  'organization_admin',
  'recruiter',
  'coach',
  'trainer',
  'learner',
]);

const PERSONAL_WORKSPACE_ID = 'personal';

export function mapKeycloakTokenToAccessContext(token: unknown): AccessContext {
  if (!isRecord(token)) {
    const personalWorkspace = createPersonalWorkspace();

    return {
      authenticated: false,
      platformRoles: [],
      permissions: [],
      entitlements: [],
      workspaces: [personalWorkspace],
      activeWorkspace: personalWorkspace,
      activeOrganizationId: null,
      organizationRole: null,
    };
  }

  const rawRoles = extractRawRoles(token);

  const platformRoles = toPlatformRoles(rawRoles);
  const organizationRoles = toOrganizationRoles(rawRoles);

  const permissions = extractStringArrayClaim(token, 'permissions');

  const entitlements = extractStringArrayClaim(token, 'entitlements');

  const organizationIds = extractOrganizationIds(token);

  const workspaces = buildWorkspaces(organizationIds, organizationRoles);

  const activeWorkspace = workspaces[0] ?? null;

  return {
    authenticated: true,
    platformRoles,
    permissions,
    entitlements,
    workspaces,
    activeWorkspace,
    activeOrganizationId: null,
    organizationRole: null,
  };
}

function extractRawRoles(token: Record<string, unknown>): string[] {
  const realmAccess = token['realm_access'];
  const resourceAccess = token['resource_access'];

  const realmRoles =
    isRecord(realmAccess) && Array.isArray(realmAccess['roles'])
      ? realmAccess['roles'].filter((role): role is string => typeof role === 'string')
      : [];

  const clientId = environment.keycloak.config.clientId;

  const clientAccess = isRecord(resourceAccess) ? resourceAccess[clientId] : undefined;

  const clientRoles =
    isRecord(clientAccess) && Array.isArray(clientAccess['roles'])
      ? clientAccess['roles'].filter((role): role is string => typeof role === 'string')
      : [];

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

function toPlatformRoles(roles: readonly string[]): PlatformRole[] {
  return roles.filter((role): role is PlatformRole => PLATFORM_ROLES.has(role as PlatformRole));
}

function toOrganizationRoles(roles: readonly string[]): OrganizationRole[] {
  return roles.filter((role): role is OrganizationRole =>
    ORGANIZATION_ROLES.has(role as OrganizationRole),
  );
}

function extractStringArrayClaim(token: Record<string, unknown>, claimName: string): string[] {
  const claim = token[claimName];

  if (!Array.isArray(claim)) {
    return [];
  }

  return Array.from(new Set(claim.filter((value): value is string => typeof value === 'string')));
}

function extractOrganizationIds(token: Record<string, unknown>): string[] {
  const rawOrganizations =
    token['organizations'] ?? token['organizationIds'] ?? token['orgs'] ?? token['groups'];

  if (!Array.isArray(rawOrganizations)) {
    return [];
  }

  return Array.from(
    new Set(
      rawOrganizations
        .filter((organization): organization is string => typeof organization === 'string')
        .map(normalizeOrganizationId)
        .filter((organizationId) => organizationId.length > 0),
    ),
  );
}

function normalizeOrganizationId(value: string): string {
  return value
    .replace(/^\/orgs\//, '')
    .replace(/^\//, '')
    .trim();
}

function buildWorkspaces(
  organizationIds: readonly string[],
  organizationRoles: readonly OrganizationRole[],
): WorkspaceContext[] {
  const organizationRole = resolveTemporaryOrganizationRole(organizationRoles);

  return [
    createPersonalWorkspace(),

    ...organizationIds.map((organizationId) =>
      createOrganizationWorkspace(organizationId, organizationRole),
    ),
  ];
}

function createPersonalWorkspace(): WorkspaceContext {
  return {
    id: PERSONAL_WORKSPACE_ID,
    kind: 'personal',
    label: 'Compte personnel',
  };
}

function createOrganizationWorkspace(
  organizationId: string,
  organizationRole: OrganizationRole | null,
): WorkspaceContext {
  return {
    id: `organization:${organizationId}`,
    kind: 'organization',
    label: formatOrganizationLabel(organizationId),
    organizationId,
    organizationRole: organizationRole ?? undefined,
  };
}

/**
 * Temporaire tant que les rôles ne sont pas fournis
 * organisation par organisation par l’API applicative.
 *
 * Une liste globale de rôles Keycloak ne permet pas
 * de savoir quel rôle appartient à quelle organisation.
 */
function resolveTemporaryOrganizationRole(
  roles: readonly OrganizationRole[],
): OrganizationRole | null {
  return roles[0] ?? null;
}

function formatOrganizationLabel(organizationId: string): string {
  return organizationId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
