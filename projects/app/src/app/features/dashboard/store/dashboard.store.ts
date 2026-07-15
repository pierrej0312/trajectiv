import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { buildRenewalLabel, daysUntilLocalDate } from '../utils/dashboard-date.util';

import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { catchError, EMPTY, exhaustMap, pipe, tap } from 'rxjs';

import { ProfileCompletionResponseApiDto, ProfileControllerService } from '@shared-api-client';

import { AppContextStore } from '@core';

import {
  DashboardCreditsVm,
  DashboardHeroVm,
  DashboardProfileCompletionVm,
  DashboardProfileVm,
  DashboardSubscriptionVm,
} from '../models/dashboard.model';

export type DashboardProfileCompletionStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DashboardState = {

  readonly profileCompletionResponse: ProfileCompletionResponseApiDto | null;

  readonly profileCompletionStatus: DashboardProfileCompletionStatus;

  readonly profileCompletionError: unknown | null;
};

const initialState: DashboardState = {
  profileCompletionResponse: null,
  profileCompletionStatus: 'idle',
  profileCompletionError: null,
};

export const DashboardStore = signalStore(
  withState(initialState),

  withComputed((store, appContext = inject(AppContextStore)) => {
    const profile = computed<DashboardProfileVm>(() => {
      const me = appContext.me();

      const displayName = appContext.displayName();

      return {
        displayName,
        firstName: resolveFirstName(me?.firstName, displayName),
        avatarUrl: appContext.avatarUrl(),
        initials: appContext.initials(),
      };
    });

    const hero = computed<DashboardHeroVm>(() => {
      const me = appContext.me();

      return {
        firstName: resolveFirstName(me?.firstName, appContext.displayName()),
        targetRoleLabel: me?.profile?.targetRoleLabel ?? null,
      };
    });

    const subscription = computed<DashboardSubscriptionVm>(() => {
      return {
        label: appContext.planLabel(),
        premium: appContext.isPremium(),
      };
    });

    const credits = computed<DashboardCreditsVm>(() => {
      const creditDto = appContext.me()?.credits;

      const monthlyLimit = normalizePositiveNumber(creditDto?.monthlyLimit);

      const used = normalizePositiveNumber(creditDto?.used);

      const remaining =
        creditDto?.remaining !== undefined
          ? normalizePositiveNumber(creditDto.remaining)
          : Math.max(monthlyLimit - used, 0);

      const nextRenewalDate = creditDto?.nextRenewalDate ?? null;

      const renewalDays = nextRenewalDate ? daysUntilLocalDate(nextRenewalDate) : null;

      return {
        monthlyLimit,
        used,
        remaining,

        usedPercentage: calculatePercentage(used, monthlyLimit),

        remainingPercentage: calculatePercentage(remaining, monthlyLimit),

        exhausted: monthlyLimit > 0 && remaining === 0,

        nextRenewalDate,
        renewalDays,
        renewalLabel: buildRenewalLabel(renewalDays),
      };
    });

    const profileCompletion = computed<DashboardProfileCompletionVm>(() => {
      const response = store.profileCompletionResponse();

      const percentage = clampPercentage(response?.completionPercentage ?? 0);

      const missingCount = response?.missingFields?.length ?? 0;

      const recommendedActionCount = response?.recommendedActions?.length ?? 0;

      return {
        percentage,
        missingCount,
        recommendedActionCount,

        complete: percentage === 100 && missingCount === 0,
      };
    });

    return {
      hero,
      profile,
      subscription,
      credits,
      profileCompletion,

      isContextReady: computed(() => {
        return appContext.isReady();
      }),

      hasContextError: computed(() => {
        return appContext.hasError();
      }),

      isProfileCompletionIdle: computed(() => {
        return store.profileCompletionStatus() === 'idle';
      }),

      isProfileCompletionLoading: computed(() => {
        return store.profileCompletionStatus() === 'loading';
      }),

      isProfileCompletionReady: computed(() => {
        return store.profileCompletionStatus() === 'ready';
      }),

      hasProfileCompletionError: computed(() => {
        return store.profileCompletionStatus() === 'error';
      }),
    };
  }),

  withMethods((store, profileApi = inject(ProfileControllerService)) => {

    const loadProfileCompletionInternal = rxMethod<boolean>(
      pipe(
        exhaustMap((forceReload) => {
          const currentStatus = store.profileCompletionStatus();

          if (!forceReload && (currentStatus === 'loading' || currentStatus === 'ready')) {
            return EMPTY;
          }

          patchState(store, {
            profileCompletionStatus: 'loading',

            profileCompletionError: null,
          });

          return profileApi
            .getMyProfileCompletion('body', false, {
              httpHeaderAccept: 'application/json',

              transferCache: false,
            })
            .pipe(
              tap((response) => {
                patchState(store, {
                  profileCompletionResponse: response,

                  profileCompletionStatus: 'ready',

                  profileCompletionError: null,
                });
              }),

              catchError((error: unknown) => {
                console.error('[DashboardStore] Unable to load profile completion', error);

                patchState(store, {
                  profileCompletionResponse: null,

                  profileCompletionStatus: 'error',

                  profileCompletionError: error,
                });

                return EMPTY;
              }),
            );
        }),
      ),
    );

    return {
      loadProfileCompletion(): void {
        loadProfileCompletionInternal(false);
      },

      reloadProfileCompletion(): void {
        loadProfileCompletionInternal(true);
      },

      clearProfileCompletion(): void {
        patchState(store, {
          profileCompletionResponse: null,
          profileCompletionStatus: 'idle',
          profileCompletionError: null,
        });
      },
    };
  }),

  withHooks({
    onInit(store): void {
      store.loadProfileCompletion();
    },
  }),
);

function resolveFirstName(firstName: string | undefined, displayName: string): string {
  const normalizedFirstName = firstName?.trim();

  if (normalizedFirstName) {
    return normalizedFirstName;
  }

  const firstDisplayNamePart = displayName.trim().split(/\s+/).at(0);

  return firstDisplayNamePart || 'toi';
}

function normalizePositiveNumber(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function calculatePercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return clampPercentage(Math.round((value / total) * 100));
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}
