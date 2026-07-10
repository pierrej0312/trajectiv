import { DestroyRef, computed, inject } from '@angular/core';

import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

import { patchState, signalStore, withComputed, withHooks, withState } from '@ngrx/signals';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type RouterLoadingState = {
  navigating: boolean;
  currentUrl: string;
};

const normalizeUrl = (url: string): string => {
  return url.split('?')[0]?.split('#')[0] ?? url;
};

export const RouterLoadingStore = signalStore(
  { providedIn: 'root' },

  withState<RouterLoadingState>({
    navigating: true,
    currentUrl: '/',
  }),

  withComputed((store) => ({
    isNavigating: computed(() => store.navigating()),

    isOnboardingNavigation: computed(() => {
      return store.currentUrl().startsWith('/app/onboarding');
    }),

    isAuthBridgePage: computed(() => {
      const url = store.currentUrl();

      return url.startsWith('/sign-in') || url.startsWith('/sign-up');
    }),
  })),

  withHooks((store, router = inject(Router), destroyRef = inject(DestroyRef)) => ({
    onInit(): void {
      patchState(store, {
        currentUrl: normalizeUrl(router.url),
      });

      router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          patchState(store, {
            navigating: true,
            currentUrl: normalizeUrl(event.url),
          });

          return;
        }

        if (event instanceof NavigationEnd) {
          patchState(store, {
            navigating: false,
            currentUrl: normalizeUrl(event.urlAfterRedirects),
          });

          return;
        }

        if (event instanceof NavigationCancel || event instanceof NavigationError) {
          patchState(store, {
            navigating: false,
            currentUrl: normalizeUrl(router.url),
          });
        }
      });
    },
  })),
);
