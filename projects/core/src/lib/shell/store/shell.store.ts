import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

import { patchState, signalStore, withComputed, withHooks, withState } from '@ngrx/signals';

import type {
  BottomBarVariant,
  NavbarVariant,
  ShellLayoutConfig,
  ShellMode,
  ShellState,
  SidebarVariant,
} from '../models/shell.model';

import { normalizeShellUrl, resolveShellRouteData } from '../utils/shell-route.util';

const SHELL_LAYOUT_BY_MODE: Readonly<Record<ShellMode, ShellLayoutConfig>> = {
  app: {
    sidebarVariant: 'app-navigation',
    navbarVariant: 'app',
    bottomBarVariant: 'app-navigation',
  },

  onboarding: {
    sidebarVariant: 'onboarding-stepper',
    navbarVariant: 'onboarding',
    bottomBarVariant: 'hidden',
  },

  immersive: {
    sidebarVariant: 'hidden',
    navbarVariant: 'immersive',
    bottomBarVariant: 'hidden',
  },
};

const initialState: ShellState = {
  currentUrl: '/',
  navigating: false,
  routeData: {},
};

/**
 * État transverse du shell applicatif.
 *
 * La configuration visuelle est résolue depuis les données
 * déclarées dans l’arbre des routes Angular.
 */
export const ShellStore = signalStore(

  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => {
    const shellMode = computed<ShellMode>(() => {
      return store.routeData().shellMode ?? 'app';
    });

    const layoutConfig = computed<ShellLayoutConfig>(() => {
      return SHELL_LAYOUT_BY_MODE[shellMode()];
    });

    return {
      shellMode,
      layoutConfig,

      sidebarVariant: computed<SidebarVariant>(() => {
        return layoutConfig().sidebarVariant;
      }),

      navbarVariant: computed<NavbarVariant>(() => {
        return layoutConfig().navbarVariant;
      }),

      bottomBarVariant: computed<BottomBarVariant>(() => {
        return layoutConfig().bottomBarVariant;
      }),

      showSidebar: computed(() => {
        return layoutConfig().sidebarVariant !== 'hidden';
      }),

      showNavbar: computed(() => {
        return layoutConfig().navbarVariant !== 'hidden';
      }),

      showBottomBar: computed(() => {
        return layoutConfig().bottomBarVariant !== 'hidden';
      }),

      isAuthBridgePage: computed(() => {
        const url = store.currentUrl();

        return url.startsWith('/sign-in') || url.startsWith('/sign-up');
      }),

      isOnboardingNavigation: computed(() => {
        return shellMode() === 'onboarding';
      }),

      isAppShell: computed(() => {
        return shellMode() === 'app';
      }),

      isOnboardingShell: computed(() => {
        return shellMode() === 'onboarding';
      }),

      isImmersiveShell: computed(() => {
        return shellMode() === 'immersive';
      }),

      pageTitle: computed(() => {
        return store.routeData().pageTitle ?? null;
      }),

      pageSubtitle: computed(() => {
        return store.routeData().pageSubtitle ?? null;
      }),

      pageIcon: computed(() => {
        return store.routeData().pageIcon ?? null;
      }),

      parentNavItemId: computed(() => {
        return store.routeData().parentNavItemId ?? null;
      }),

      showSearch: computed(() => {
        return layoutConfig().navbarVariant === 'app' && store.routeData().hideSearch !== true;
      }),

      showBackButton: computed(() => {
        return store.routeData().showBackButton === true;
      }),
    };
  }),

  withHooks((store, router = inject(Router), destroyRef = inject(DestroyRef)) => ({
    onInit(): void {
      patchState(store, {
        currentUrl: normalizeShellUrl(router.url),
        navigating: router.currentNavigation() !== null,
        routeData: resolveShellRouteData(router.routerState.snapshot),
      });

      router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          patchState(store, {
            navigating: true,
          });

          return;
        }

        if (event instanceof NavigationEnd) {
          patchState(store, {
            currentUrl: normalizeShellUrl(event.urlAfterRedirects),
            navigating: false,
            routeData: resolveShellRouteData(router.routerState.snapshot),
          });

          return;
        }

        if (event instanceof NavigationCancel || event instanceof NavigationError) {
          patchState(store, {
            currentUrl: normalizeShellUrl(router.url),
            navigating: false,
            routeData: resolveShellRouteData(router.routerState.snapshot),
          });
        }
      });
    },
  })),
);
