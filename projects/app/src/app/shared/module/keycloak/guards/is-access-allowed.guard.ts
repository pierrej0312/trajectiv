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

const isAccessAllowed = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): boolean | UrlTree => {
  const navigation = inject(NavigationStore);
  const router = inject(Router);

  const requirement = route.data['access'] as AccessRequirement | undefined;

  if (canAccess(requirement ?? {}, navigation.accessContext())) {
    return true;
  }

  return router.createUrlTree(['/app', 'dashboard']);
};

export const isAllowedGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  return isAccessAllowed(route, state);
};

export const isAllowedChildGuard: CanActivateChildFn = (childRoute, state): boolean | UrlTree => {
  return isAccessAllowed(childRoute, state);
};
