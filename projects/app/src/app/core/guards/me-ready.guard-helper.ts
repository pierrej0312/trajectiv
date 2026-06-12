import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router, UrlTree } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';

import { AppContextStore } from '@core';

type GuardResult = boolean | UrlTree;

export function whenMeReady(
  callback: (appContext: InstanceType<typeof AppContextStore>, router: Router) => GuardResult,
): GuardResult | Observable<GuardResult> {
  const appContext = inject(AppContextStore);
  const router = inject(Router);

  if (appContext.isIdle()) {
    appContext.loadMe();
  }

  if (appContext.isReady()) {
    return callback(appContext, router);
  }

  if (appContext.hasError() || appContext.isDisabled()) {
    return true;
  }

  return toObservable(appContext.status).pipe(
    filter((status) => status === 'ready' || status === 'error'),
    take(1),
    map((status) => {
      if (status === 'error') {
        return true;
      }

      if (appContext.isDisabled()) {
        return true;
      }

      return callback(appContext, router);
    }),
  );
}
