import { CanActivateChildFn, CanActivateFn } from '@angular/router';

import { whenMeReady } from './me-ready.guard-helper';

export const onboardingCompletedGuard: CanActivateChildFn = () => {
  return whenMeReady((appContext, router) => {
    if (appContext.isOnboardingCompleted()) {
      return true;
    }

    return router.createUrlTree(['/app/onboarding']);
  });
};
