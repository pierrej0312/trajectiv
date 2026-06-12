import { CanActivateFn } from '@angular/router';

import { whenMeReady } from './me-ready.guard-helper';

export const onboardingIncompleteGuard: CanActivateFn = () => {
  return whenMeReady((appContext, router) => {
    if (!appContext.isOnboardingCompleted()) {
      return true;
    }

    return router.createUrlTree(['/app/dashboard']);
  });
};
