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

import {
  DEFAULT_AVATAR_BEARD_COLOR,
  DEFAULT_AVATAR_BEARD_STYLE,
  DEFAULT_AVATAR_BODY_TYPE,
  DEFAULT_AVATAR_CUSTOMIZATION,
  DEFAULT_AVATAR_HAIR_COLOR,
  DEFAULT_AVATAR_HAIR_STYLE,
  DEFAULT_AVATAR_SKIN_INTENSITY,
  DEFAULT_AVATAR_SKIN_TONE,
} from '../defaults/default-avatar-customization';
import { resolveCompanionConfig } from '../resolvers/companion-config.resolver';

type AvatarCustomizationStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'deleting' | 'error';

type AvatarCustomizationState = {
  customization: AvatarCustomizationResponseApiDto | null;
  draftCustomization: AvatarCustomizationResponseApiDto | null;
  draftValid: boolean;
  status: AvatarCustomizationStatus;
  errorMessage: string | null;
  saveCompletedAt: number | null;
  avatarPreviewUrl: string | null;
  avatarPreviewBlob: Blob | null;
};

const initialState: AvatarCustomizationState = {
  customization: null,
  draftCustomization: null,
  draftValid: true,
  status: 'idle',
  errorMessage: null,
  saveCompletedAt: null,
  avatarPreviewUrl: null,
  avatarPreviewBlob: null,
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

    isIdle: computed(() => store.status() === 'idle'),

    hasCustomization: computed(() => store.customization() !== null),
    hasDraft: computed(() => store.draftCustomization() !== null),
    hasAvatarPreview: computed(() => store.avatarPreviewUrl() !== null),

    effectiveCustomization: computed(
      () => store.draftCustomization() ?? store.customization() ?? DEFAULT_AVATAR_CUSTOMIZATION,
    ),

    companionConfig: computed(() =>
      resolveCompanionConfig(
        store.draftCustomization() ?? store.customization() ?? DEFAULT_AVATAR_CUSTOMIZATION,
      ),
    ),
    isBusy: computed(
      () =>
        store.status() === 'loading' ||
        store.status() === 'saving' ||
        store.status() === 'deleting',
    ),
    canSaveDraft: computed(
      () =>
        store.draftValid() &&
        !(
          store.status() === 'loading' ||
          store.status() === 'saving' ||
          store.status() === 'deleting'
        ),
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
                  draftCustomization: null,
                  errorMessage: null,
                });
              }),
              catchError((error: unknown) => {
                if (isNotFoundError(error)) {
                  const previousUrl = store.avatarPreviewUrl();

                  if (previousUrl) {
                    URL.revokeObjectURL(previousUrl);
                  }

                  patchState(store, {
                    customization: null,
                    status: 'ready',
                    draftCustomization: null,
                    errorMessage: null,
                    avatarPreviewUrl: null,
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
            saveCompletedAt: null,
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
                  draftCustomization: null,
                  errorMessage: null,
                  saveCompletedAt: Date.now(),
                });
              }),
              catchError((error: unknown) => {
                console.error('[AvatarCustomizationStore] create failed', error);

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
                  draftCustomization: null,
                  errorMessage: null,
                  saveCompletedAt: Date.now(),
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
                const previousUrl = store.avatarPreviewUrl();

                if (previousUrl) {
                  URL.revokeObjectURL(previousUrl);
                }

                patchState(store, {
                  customization: null,
                  status: 'ready',
                  draftCustomization: null,
                  errorMessage: null,
                  avatarPreviewUrl: null,
                });
              }),
              catchError((error: unknown) => {
                if (isNotFoundError(error)) {
                  const previousUrl = store.avatarPreviewUrl();

                  if (previousUrl) {
                    URL.revokeObjectURL(previousUrl);
                  }

                  patchState(store, {
                    customization: null,
                    status: 'ready',
                    draftCustomization: null,
                    errorMessage: null,
                    avatarPreviewUrl: null,
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

    setAvatarPreviewBlob(blob: Blob): void {
      const previousUrl = store.avatarPreviewUrl();

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      patchState(store, {
        avatarPreviewBlob: blob,
        avatarPreviewUrl: URL.createObjectURL(blob),
      });
    },

    clearAvatarPreview(): void {
      const previousUrl = store.avatarPreviewUrl();

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      patchState(store, {
        avatarPreviewBlob: null,
        avatarPreviewUrl: null,
      });
    },

    uploadAvatarPreview: rxMethod<void>(
      pipe(
        switchMap(() => {
          const blob = store.avatarPreviewBlob();

          console.log('[AvatarStore] blob before upload', blob);

          if (!blob) {
            console.warn('[AvatarStore] no blob to upload');
            return EMPTY;
          }

          return meAvatarApi
            .uploadAvatar(blob, 'body', false, {
              httpHeaderAccept: 'application/json',
              transferCache: false,
            })
            .pipe(
              tap((response) => {
                console.log('[AvatarStore] upload succeeded', response);

                patchState(store, {
                  avatarPreviewBlob: null,
                });
              }),
              catchError((error: unknown) => {
                console.error('[AvatarStore] upload failed', error);

                patchState(store, {
                  status: 'error',
                  errorMessage: 'Impossible d’enregistrer l’image de ton avatar.',
                });

                return EMPTY;
              }),
            );
        }),
      ),
    ),

    resetDraftToDefault(): void {
      patchState(store, {
        draftCustomization: DEFAULT_AVATAR_CUSTOMIZATION,
        draftValid: true,
        errorMessage: null,
      });
    },

    clearDraft(): void {
      patchState(store, {
        draftCustomization: null,
        draftValid: true,
      });
    },

    saveDraft(): void {
      const customization = store.effectiveCustomization();

      const payload: CreateAvatarCustomizationRequestApiDto = {
        bodyType: customization.bodyType ?? DEFAULT_AVATAR_BODY_TYPE,
        skinTone: customization.skinTone ?? DEFAULT_AVATAR_SKIN_TONE,
        skinIntensity: customization.skinIntensity ?? DEFAULT_AVATAR_SKIN_INTENSITY,
        hairStyle: customization.hairStyle ?? DEFAULT_AVATAR_HAIR_STYLE,
        hairColor: customization.hairColor ?? DEFAULT_AVATAR_HAIR_COLOR,
        beardStyle: customization.beardStyle ?? DEFAULT_AVATAR_BEARD_STYLE,
        beardColor: customization.beardColor ?? DEFAULT_AVATAR_BEARD_COLOR,
      };

      this.save(payload);
    },

    previewDraft(payload: CreateAvatarCustomizationRequestApiDto): void {
      patchState(store, {
        draftCustomization: {
          ...DEFAULT_AVATAR_CUSTOMIZATION,
          ...store.customization(),
          ...payload,
        },
      });
    },

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
        draftCustomization: null,
        errorMessage: null,
      });
    },
    setDraftValidity(isValid: boolean): void {
      patchState(store, {
        draftValid: isValid,
      });
    },
  })),
);

function isNotFoundError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
