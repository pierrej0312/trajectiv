import { inject } from '@angular/core';

import { toObservable } from '@angular/core/rxjs-interop';

import {
  type ActivatedRouteSnapshot,
  type CanActivateChildFn,
  type CanActivateFn,
  Router,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';

import { filter, map, take, type Observable } from 'rxjs';

import { AppContextStore, canAccess, type AccessRequirement } from '@core';

import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

type AccessGuardResult = boolean | UrlTree;

function resolveAccess(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): AccessGuardResult | Observable<AccessGuardResult> {
  const appContext = inject(AppContextStore);

  const navigation = inject(NavigationStore);

  const router = inject(Router);

  if (appContext.isIdle()) {
    appContext.loadMe();
  }

  if (appContext.isReady()) {
    return evaluateAccess(route, state, navigation, router);
  }

  if (appContext.hasError()) {
    return router.parseUrl('/app/access-denied');
  }

  return toObservable(appContext.status).pipe(
    filter((status) => status === 'ready' || status === 'error'),

    take(1),

    map((status) => {
      if (status === 'error') {
        return router.parseUrl('/app/access-denied');
      }

      return evaluateAccess(route, state, navigation, router);
    }),
  );
}

function evaluateAccess(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  navigation: InstanceType<typeof NavigationStore>,
  router: Router,
): AccessGuardResult {
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
}

export const isAllowedGuard: CanActivateFn = (route, state) => resolveAccess(route, state);

export const isAllowedChildGuard: CanActivateChildFn = (route, state) =>
  resolveAccess(route, state);

function isSameUrl(currentUrl: string, targetUrl: string): boolean {
  const currentPath = currentUrl.split(/[?#]/, 1)[0];

  const targetPath = targetUrl.split(/[?#]/, 1)[0];

  return currentPath === targetPath;
}
