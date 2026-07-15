import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import type { ShellRouteData } from '../models/shell.model';

export function normalizeShellUrl(url: string): string {
  return url.split('?')[0]?.split('#')[0] ?? url;
}

export function resolveShellRouteData(routerState: RouterStateSnapshot): ShellRouteData {
  let snapshot: ActivatedRouteSnapshot | null = routerState.root;

  let routeData: ShellRouteData = {};

  while (snapshot) {
    routeData = {
      ...routeData,
      ...(snapshot.data as ShellRouteData),
    };

    snapshot = snapshot.firstChild;
  }

  return routeData;
}
