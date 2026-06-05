import type { AccessContext, AppRole, WorkspaceContext } from '@core';
import { environment } from '@app/src/environments/environment';

const APP_ROLES = new Set<AppRole>([
  'app_user',
  'app_admin',
  'organization_owner',
  'recruiter',
  'coach',
]);

const PERSONAL_WORKSPACE_ID = 'personal';

export function mapKeycloakTokenToAccessContext(token: unknown): AccessContext {
  if (!isRecord(token)) {
    const personalWorkspace = createPersonalWorkspace();

    return {
      isAuthenticated: false,
      roles: [],
      organizationIds: [],
      activeOrganizationId: null,
      workspaces: [personalWorkspace],
      activeWorkspace: personalWorkspace,
    };
  }

  const roles = extractRoles(token);
  const organizationIds = extractOrganizationIds(token);
  const workspaces = buildWorkspaces(organizationIds);

  const activeWorkspace = workspaces[0] ?? null;

  return {
    isAuthenticated: true,
    roles,
    organizationIds,
    activeOrganizationId:
      activeWorkspace?.kind === 'organization' ? (activeWorkspace.organizationId ?? null) : null,
    workspaces,
    activeWorkspace,
  };
}

function extractRoles(token: Record<string, unknown>): AppRole[] {
  const realmAccess = token['realm_access'];
  const resourceAccess = token['resource_access'];

  const realmRoles =
    isRecord(realmAccess) && Array.isArray(realmAccess['roles']) ? realmAccess['roles'] : [];

  const clientId = environment.keycloak.config.clientId;

  const clientRoles =
    isRecord(resourceAccess) &&
    isRecord(resourceAccess[clientId]) &&
    Array.isArray(resourceAccess[clientId]['roles'])
      ? resourceAccess[clientId]['roles']
      : [];

  return toAppRoles([...realmRoles, ...clientRoles]);
}

function toAppRoles(roles: readonly unknown[]): AppRole[] {
  return roles.filter((role): role is AppRole => {
    return typeof role === 'string' && APP_ROLES.has(role as AppRole);
  });
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
        .map((organization) => normalizeOrganizationId(organization))
        .filter(Boolean),
    ),
  );
}

function normalizeOrganizationId(value: string): string {
  return value
    .replace(/^\/orgs\//, '')
    .replace(/^\//, '')
    .trim();
}

function buildWorkspaces(organizationIds: readonly string[]): WorkspaceContext[] {
  return [
    createPersonalWorkspace(),
    ...organizationIds.map((organizationId) => createOrganizationWorkspace(organizationId)),
  ];
}

function createPersonalWorkspace(): WorkspaceContext {
  return {
    id: PERSONAL_WORKSPACE_ID,
    kind: 'personal',
    label: 'Compte personnel',
  };
}

function createOrganizationWorkspace(organizationId: string): WorkspaceContext {
  return {
    id: `organization:${organizationId}`,
    kind: 'organization',
    label: formatOrganizationLabel(organizationId),
    organizationId,
  };
}

function formatOrganizationLabel(organizationId: string): string {
  return organizationId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}
