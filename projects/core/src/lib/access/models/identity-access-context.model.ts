import type { PlatformRole } from '@core';

export type IdentityAccessContext = {
  readonly authenticated: boolean;
  readonly platformRoles: readonly PlatformRole[];
};
