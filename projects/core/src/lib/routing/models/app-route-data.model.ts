import type { AccessRequirement } from '@core';

import type { ShellRouteData } from '@core';

export type AppRouteData = ShellRouteData & {
  readonly access?: AccessRequirement;
};
