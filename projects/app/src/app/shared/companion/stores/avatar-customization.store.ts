import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';

import {
  AvatarCustomizationResponseApiDto,
  CreateAvatarCustomizationRequestApiDto,
  MeAvatarControllerService,
  PatchAvatarCustomizationRequestApiDto,
} from '@shared-api-client';

import { DEFAULT_AVATAR_CUSTOMIZATION } from '../defaults/default-avatar-customization';
import { resolveCompanionConfig } from '../resolvers/companion-config.resolver';

type AvatarCustomizationStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'deleting' | 'error';

type AvatarCustomizationState = {
  customization: AvatarCustomizationResponseApiDto | null;
  status: AvatarCustomizationStatus;
  errorMessage: string | null;
};

const initialState: AvatarCustomizationState = {
  customization: null,
  status: 'idle',
  errorMessage: null,
};

export const AvatarCustomizationStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isLoading: computed(() => store.status() === 'loading'),
    isReady: computed(() => store.status() === 'ready'),
    isSaving: computed(() => store.status() === 'saving'),
    isDeleting: computed(() => store.status() === 'deleting'),
    isError: computed(() => store.status() === 'error'),

    hasCustomization: computed(() => store.customization() !== null),

    effectiveCustomization: computed(() => store.customization() ?? DEFAULT_AVATAR_CUSTOMIZATION),

    companionConfig: computed(() =>
      resolveCompanionConfig(store.customization() ?? DEFAULT_AVATAR_CUSTOMIZATION),
    ),
  })),

  withMethods((store, meAvatarApi = inject(MeAvatarControllerService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            status: 'loading',
            errorMessage: null,
          });
        }),
        switchMap(() =>
          meAvatarApi
            .getAvatarCustomization('body', false, {
              transferCache: false,
            })
            .pipe(
              tap((customization) => {
                patchState(store, {
                  customization,
                  status: 'ready',
                  errorMessage: null,
                });
              }),
              catchError((error: unknown) => {
                if (isNotFoundError(error)) {
                  patchState(store, {
                    customization: null,
                    status: 'ready',
                    errorMessage: null,
                  });

                  return EMPTY;
                }

                patchState(store, {
                  status: 'error',
                  errorMessage: 'Impossible de charger la personnalisation de l’avatar.',
                });

                return EMPTY;
              }),
            ),
        ),
      ),
    ),

    create: rxMethod<CreateAvatarCustomizationRequestApiDto>(
      pipe(
        tap(() => {
          patchState(store, {
            status: 'saving',
            errorMessage: null,
          });
        }),
        switchMap((payload) =>
          meAvatarApi
            .createAvatarCustomization(payload, 'body', false, {
              transferCache: false,
            })
            .pipe(
              tap((customization) => {
                patchState(store, {
                  customization,
                  status: 'ready',
                  errorMessage: null,
                });
              }),
              catchError(() => {
                patchState(store, {
                  status: 'error',
                  errorMessage: 'Impossible de créer la personnalisation de l’avatar.',
                });

                return EMPTY;
              }),
            ),
        ),
      ),
    ),

    patch: rxMethod<PatchAvatarCustomizationRequestApiDto>(
      pipe(
        tap(() => {
          patchState(store, {
            status: 'saving',
            errorMessage: null,
          });
        }),
        switchMap((payload) =>
          meAvatarApi
            .patchAvatarCustomization(payload, 'body', false, {
              transferCache: false,
            })
            .pipe(
              tap((customization) => {
                patchState(store, {
                  customization,
                  status: 'ready',
                  errorMessage: null,
                });
              }),
              catchError(() => {
                patchState(store, {
                  status: 'error',
                  errorMessage: 'Impossible de sauvegarder la personnalisation de l’avatar.',
                });

                return EMPTY;
              }),
            ),
        ),
      ),
    ),

    delete: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            status: 'deleting',
            errorMessage: null,
          });
        }),
        switchMap(() =>
          meAvatarApi
            .deleteAvatarCustomization('body', false, {
              transferCache: false,
            })
            .pipe(
              tap(() => {
                patchState(store, {
                  customization: null,
                  status: 'ready',
                  errorMessage: null,
                });
              }),
              catchError((error: unknown) => {
                if (isNotFoundError(error)) {
                  patchState(store, {
                    customization: null,
                    status: 'ready',
                    errorMessage: null,
                  });

                  return EMPTY;
                }

                patchState(store, {
                  status: 'error',
                  errorMessage: 'Impossible de supprimer la personnalisation de l’avatar.',
                });

                return EMPTY;
              }),
            ),
        ),
      ),
    ),

    save(payload: CreateAvatarCustomizationRequestApiDto): void {
      if (store.hasCustomization()) {
        this.patch(payload);
        return;
      }

      this.create(payload);
    },

    resetLocal(): void {
      patchState(store, {
        customization: null,
        status: 'ready',
        errorMessage: null,
      });
    },
  })),
);

function isNotFoundError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
