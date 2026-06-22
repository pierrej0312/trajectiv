import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, pipe, tap } from 'rxjs';

import { MeControllerService, MeResponseApiDto } from '@shared-api-client';

export type AppContextStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AppContextState {
  me: MeResponseApiDto | null;
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

    isDisabled: computed(() => store.me()?.status === 'DISABLED'),

    displayName: computed(() => {
      const me = store.me();

      console.log(me?.firstName);
      return me?.displayName ?? me?.firstName ?? me?.email ?? 'Utilisateur';
    }),

    email: computed(() => store.me()?.email ?? ''),

    avatarUrl: computed(() => store.me()?.avatarUrl ?? null),

    initials: computed(() => {
      const source = store.me()?.displayName || store.me()?.email || 'U';

      return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
    }),

    onboardingStatus: computed(() => store.me()?.onboarding?.status ?? 'NOT_STARTED'),

    isOnboardingCompleted: computed(() => store.me()?.onboarding?.status === 'COMPLETED'),

    shouldRedirectToOnboarding: computed(() => {
      const me = store.me();

      if (!me) {
        return false;
      }

      if (me.status !== 'ACTIVE') {
        return false;
      }

      return me.onboarding?.status !== 'COMPLETED';
    }),

    isPremium: computed(() => store.me()?.subscription?.plan === 'PREMIUM'),

    creditsRemaining: computed(() => store.me()?.credits?.remaining ?? 0),

    planLabel: computed(() => {
      const plan = store.me()?.subscription?.plan;

      return plan === 'PREMIUM' ? 'Premium' : 'Free';
    }),
  })),

  withMethods((store, meApi = inject(MeControllerService)) => {
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

          return meApi.getMe('body', false, { transferCache: false }).pipe(
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
