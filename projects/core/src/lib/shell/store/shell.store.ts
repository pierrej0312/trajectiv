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

import {
  normalizeShellUrl,
  resolveShellBreadcrumbs,
  resolveShellRouteData,
} from '../utils/shell-route.util';

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
  breadcrumbs: [],
};

export const ShellStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => {
    const shellMode = computed<ShellMode>(() => store.routeData().shellMode ?? 'app');

    const layoutConfig = computed<ShellLayoutConfig>(() => SHELL_LAYOUT_BY_MODE[shellMode()]);

    return {
      shellMode,
      layoutConfig,

      sidebarVariant: computed<SidebarVariant>(() => layoutConfig().sidebarVariant),

      navbarVariant: computed<NavbarVariant>(() => layoutConfig().navbarVariant),

      bottomBarVariant: computed<BottomBarVariant>(() => layoutConfig().bottomBarVariant),

      showSidebar: computed(() => layoutConfig().sidebarVariant !== 'hidden'),

      showNavbar: computed(() => layoutConfig().navbarVariant !== 'hidden'),

      showBottomBar: computed(() => layoutConfig().bottomBarVariant !== 'hidden'),

      isAuthBridgePage: computed(() => {
        const url = store.currentUrl();

        return url.startsWith('/sign-in') || url.startsWith('/sign-up');
      }),

      isOnboardingNavigation: computed(() => shellMode() === 'onboarding'),

      isAppShell: computed(() => shellMode() === 'app'),

      isOnboardingShell: computed(() => shellMode() === 'onboarding'),

      isImmersiveShell: computed(() => shellMode() === 'immersive'),

      pageTitle: computed(() => store.routeData().pageTitle ?? null),

      pageSubtitle: computed(() => store.routeData().pageSubtitle ?? null),

      pageIcon: computed(() => store.routeData().pageIcon ?? null),

      parentNavItemId: computed(() => store.routeData().parentNavItemId ?? null),

      showSearch: computed(
        () => layoutConfig().navbarVariant === 'app' && store.routeData().hideSearch !== true,
      ),

      showBackButton: computed(() => store.routeData().showBackButton === true),

      hasBreadcrumbs: computed(() => store.breadcrumbs().length > 0),
    };
  }),

  withHooks((store, router = inject(Router), destroyRef = inject(DestroyRef)) => ({
    onInit(): void {
      patchState(
        store,
        resolveRouterShellState(router, router.url, router.currentNavigation() !== null),
      );

      router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          patchState(store, {
            navigating: true,
          });

          return;
        }

        if (event instanceof NavigationEnd) {
          patchState(store, resolveRouterShellState(router, event.urlAfterRedirects, false));

          return;
        }

        if (event instanceof NavigationCancel || event instanceof NavigationError) {
          patchState(store, resolveRouterShellState(router, router.url, false));
        }
      });
    },
  })),
);

function resolveRouterShellState(
  router: Router,
  currentUrl: string,
  navigating: boolean,
): Partial<ShellState> {
  const routerState = router.routerState.snapshot;

  return {
    currentUrl: normalizeShellUrl(currentUrl),

    navigating,

    routeData: resolveShellRouteData(routerState),

    breadcrumbs: resolveShellBreadcrumbs(routerState),
  };
}
