import { inject } from '@angular/core';

import {
  type ActivatedRouteSnapshot,
  type CanActivateChildFn,
  type CanActivateFn,
  Router,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';

import { canAccess, type AccessRequirement } from '@core';

import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

const DEFAULT_FALLBACK_URL = '/app/dashboard';

const isAccessAllowed = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree => {
  const navigation = inject(NavigationStore);

  const router = inject(Router);

  const requirement = route.data['access'] as AccessRequirement | undefined;

  if (canAccess(requirement ?? {}, navigation.accessContext())) {
    return true;
  }

  const fallbackItem =
    navigation.homeItem() ??
    navigation
      .visibleItems()
      .find(
        (item) =>
          typeof item.route === 'string' &&
          item.route.length > 0 &&
          !isSameUrl(state.url, item.route),
      );

  return router.parseUrl(fallbackItem?.route ?? '/app/access-denied');
};

export const isAllowedGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  return isAccessAllowed(route, state);
};

export const isAllowedChildGuard: CanActivateChildFn = (childRoute, state): boolean | UrlTree => {
  return isAccessAllowed(childRoute, state);
};

function isSameUrl(currentUrl: string, targetUrl: string): boolean {
  const currentPath = currentUrl.split(/[?#]/, 1)[0];

  const targetPath = targetUrl.split(/[?#]/, 1)[0];

  return currentPath === targetPath;
}
