import type { IdentityAccessContext, PlatformRole } from '@core';
import { environment } from '@app/src/environments/environment';

const PLATFORM_ROLES = new Set<PlatformRole>(['app_user', 'app_admin']);

export function mapKeycloakTokenToIdentityContext(token: unknown): IdentityAccessContext {
  if (!isRecord(token)) {
    return {
      authenticated: false,
      platformRoles: [],
    };
  }

  return {
    authenticated: true,
    platformRoles: extractPlatformRoles(token),
  };
}

function extractPlatformRoles(token: Record<string, unknown>): readonly PlatformRole[] {
  const roles = extractRawRoles(token);

  return roles.filter((role): role is PlatformRole => PLATFORM_ROLES.has(role as PlatformRole));
}

function extractRawRoles(token: Record<string, unknown>): readonly string[] {
  const realmRoles = extractRoles(token['realm_access']);

  const resourceAccess = token['resource_access'];

  const clientId = environment.keycloak.config.clientId;

  const clientRoles = isRecord(resourceAccess) ? extractRoles(resourceAccess[clientId]) : [];

  return [...new Set([...realmRoles, ...clientRoles])];
}

function extractRoles(accessClaim: unknown): readonly string[] {
  if (!isRecord(accessClaim)) {
    return [];
  }

  const roles = accessClaim['roles'];

  if (!Array.isArray(roles)) {
    return [];
  }

  return roles.filter((role): role is string => typeof role === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
