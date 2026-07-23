import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import type { ShellBreadcrumbItem, ShellRouteData } from '@core';

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

    snapshot = snapshot.children.find((child) => child.outlet === 'primary') ?? null;
  }

  return routeData;
}

export function resolveShellBreadcrumbs(
  routerState: RouterStateSnapshot,
): readonly ShellBreadcrumbItem[] {
  const routeSnapshots = getPrimaryRoutePath(routerState.root);

  const breadcrumbs: ShellBreadcrumbItem[] = [];

  const consumedSegments: string[] = [];

  for (const snapshot of routeSnapshots) {
    const segments = snapshot.url.map((segment) => segment.path.trim()).filter(Boolean);

    consumedSegments.push(...segments);

    /*
     * On lit ici uniquement les données déclarées
     * directement sur cette configuration de route.
     *
     * snapshot.data peut inclure des données héritées
     * ou résolues et provoquer des doublons.
     */
    const routeData = snapshot.routeConfig?.data as ShellRouteData | undefined;

    const breadcrumb = routeData?.breadcrumb;

    if (!breadcrumb) {
      continue;
    }

    const label = breadcrumb.label.trim();

    if (!label) {
      continue;
    }

    breadcrumbs.push({
      label,

      icon: breadcrumb.icon ?? null,

      route: breadcrumb.clickable === false ? null : buildBreadcrumbRoute(consumedSegments),

      current: false,
    });
  }

  return breadcrumbs.map((item, index, items) => {
    const current = index === items.length - 1;

    return {
      ...item,

      current,

      /*
       * La page courante n'est pas cliquable,
       * même si clickable n'a pas été mis à false.
       */
      route: current ? null : item.route,
    };
  });
}

function getPrimaryRoutePath(root: ActivatedRouteSnapshot): readonly ActivatedRouteSnapshot[] {
  const path: ActivatedRouteSnapshot[] = [];

  let current: ActivatedRouteSnapshot | null = root;

  while (current) {
    path.push(current);

    current = current.children.find((child) => child.outlet === 'primary') ?? null;
  }

  return path;
}

function buildBreadcrumbRoute(segments: readonly string[]): string | null {
  if (segments.length === 0) {
    return null;
  }

  return `/${segments.join('/')}`;
}
