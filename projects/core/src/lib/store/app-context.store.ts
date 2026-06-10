import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, pipe, tap } from 'rxjs';

import {
  Me,
  OnboardingStatus,
  SubscriptionPlan,
  UserStatus,
} from '@shared-domain';
import { MeDataAccess } from '@shared-data-access';

export type AppContextStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AppContextState {
  me: Me | null;
  status: AppContextStatus;
  error: unknown | null;
}

const initialState: AppContextState = {
  me: null,
  status: 'idle',
  error: null,
};

export const AppContextStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isIdle: computed(() => store.status() === 'idle'),
    isLoading: computed(() => store.status() === 'loading'),
    isReady: computed(() => store.status() === 'ready'),
    hasError: computed(() => store.status() === 'error'),
    isDisabled: computed(() => store.me()?.status === UserStatus.Disabled),
    displayName: computed(() => {
      const me = store.me();
      return me?.displayName || me?.email || 'Utilisateur';
    }),
    email: computed(() => store.me()?.email ?? ''),
    avatarUrl: computed(() => store.me()?.avatarUrl ?? null),
    onboardingStatus: computed(() => store.me()?.onboarding.status ?? OnboardingStatus.NotStarted),
    isOnboardingCompleted: computed(
      () => store.me()?.onboarding.status === OnboardingStatus.Completed,
    ),
    shouldRedirectToOnboarding: computed(() => {
      const me = store.me();
      if (!me) {
        return false;
      }
      if (me.status !== UserStatus.Active) {
        return false;
      }
      return me.onboarding.status !== OnboardingStatus.Completed;
    }),
    isPremium: computed(() => store.me()?.subscription.plan === SubscriptionPlan.Premium),
    creditsRemaining: computed(() => store.me()?.credits.remaining ?? 0),
    planLabel: computed(() => {
      const plan = store.me()?.subscription.plan;
      return plan === SubscriptionPlan.Premium ? 'Premium' : 'Free';
    }),
    initials: computed(() => {
      const source = store.me()?.displayName || store.me()?.email || 'U';
      return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
    }),
  })),
  withMethods((store, meDataAccess = inject(MeDataAccess)) => {
    const loadMeInternal = rxMethod<boolean>(
      pipe(
        exhaustMap((forceReload) => {
          const currentStatus = store.status();

          if (!forceReload && (currentStatus === 'loading' || currentStatus === 'ready')) {
            return EMPTY;
          }

          patchState(store, {
            status: 'loading',
            error: null,
          });

          return meDataAccess.getMe().pipe(
            tap((me) => {
              patchState(store, {
                me,
                status: 'ready',
                error: null,
              });
            }),
            catchError((error: unknown) => {
              patchState(store, {
                me: null,
                status: 'error',
                error,
              });

              return EMPTY;
            }),
          );
        }),
      ),
    );

    return {
      loadMe(): void {
        loadMeInternal(false);
      },

      reloadMe(): void {
        loadMeInternal(true);
      },

      clear(): void {
        patchState(store, {
          me: null,
          status: 'idle',
          error: null,
        });
      },
    };
  }),
);
