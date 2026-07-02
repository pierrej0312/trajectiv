import { AfterViewInit, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { Panel } from 'primeng/panel';
import { AVATAR_BODY_MODEL_URL_BY_TYPE } from '@shared/companion/registries/avatar-assets.registry';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';
import { avatarStepFormToCreatePayload, createAvatarStepForm, patchAvatarStepFormFromCustomization } from '@features/onboarding/steps/avatar-step/avatar-step.form';
import {
  AVATAR_BEARD_STYLE_OPTIONS,
  AVATAR_BODY_TYPE_OPTIONS, AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS
} from '@shared/companion/registries/avatar-customization-options.registry';
import { ReactiveFormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';
import { startWith, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AvatarBeardStyle,
  AvatarBodyType,
  AvatarHairStyle,
  AvatarSkinTone,
} from '@shared/companion/models/avatar-customization-options.model';
import { DEFAULT_AVATAR_CUSTOMIZATION } from '@shared/companion/defaults/default-avatar-customization';

@Component({
  selector: 'app-avatar-step',
  imports: [Panel, ReactiveFormsModule, Slider],
  templateUrl: './avatar-step.html',
  styleUrl: './avatar-step.css',
})
export class AvatarStep {
  readonly onboarding = inject(OnboardingStore);
  readonly avatarStore = inject(AvatarCustomizationStore);

  private readonly destroyRef = inject(DestroyRef);

  readonly form = createAvatarStepForm();

  readonly bodyTypeOptions = AVATAR_BODY_TYPE_OPTIONS;
  readonly skinToneOptions = AVATAR_SKIN_TONE_OPTIONS;
  readonly hairStyleOptions = AVATAR_HAIR_STYLE_OPTIONS;
  readonly beardStyleOptions = AVATAR_BEARD_STYLE_OPTIONS;

  readonly hasHydratedForm = signal(false);
  readonly shouldGoNextAfterSave = signal(false);

  constructor() {
    this.avatarStore.load();

    effect(() => {
      const customization = this.avatarStore.effectiveCustomization();

      if (this.hasHydratedForm()) {
        return;
      }

      patchAvatarStepFormFromCustomization(this.form, customization, {
        emitEvent: false,
      });

      this.avatarStore.previewDraft(avatarStepFormToCreatePayload(this.form));
      this.hasHydratedForm.set(true);
    });

    effect(() => {
      const saveCompletedAt = this.avatarStore.saveCompletedAt();

      if (!this.shouldGoNextAfterSave() || !saveCompletedAt) {
        return;
      }

      this.shouldGoNextAfterSave.set(false);
      this.onboarding.goNext();
    });

    this.form.valueChanges
      .pipe(
        startWith(this.form.getRawValue()),
        tap(() => {
          if (!this.hasHydratedForm()) {
            return;
          }

          if (this.form.invalid) {
            return;
          }

          this.avatarStore.previewDraft(avatarStepFormToCreatePayload(this.form));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  selectBodyType(value: AvatarBodyType): void {
    this.form.controls.bodyType.setValue(value);
    this.form.controls.bodyType.markAsDirty();
  }

  selectSkinTone(value: AvatarSkinTone): void {
    this.form.controls.skinTone.setValue(value);
    this.form.controls.skinTone.markAsDirty();
  }

  selectHairStyle(value: AvatarHairStyle): void {
    this.form.controls.hairStyle.setValue(value);
    this.form.controls.hairStyle.markAsDirty();
  }

  selectBeardStyle(value: AvatarBeardStyle): void {
    this.form.controls.beardStyle.setValue(value);
    this.form.controls.beardStyle.markAsDirty();
  }

  continue(): void {
    if (this.form.invalid || this.avatarStore.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.shouldGoNextAfterSave.set(true);
    this.avatarStore.save(avatarStepFormToCreatePayload(this.form));
  }

  skip(): void {
    this.avatarStore.clearDraft();
    this.onboarding.goNext();
  }

  reset(): void {
    if (this.avatarStore.hasCustomization()) {
      this.avatarStore.delete();
    }

    patchAvatarStepFormFromCustomization(this.form, DEFAULT_AVATAR_CUSTOMIZATION, {
      emitEvent: true,
    });

    this.avatarStore.previewDraft(avatarStepFormToCreatePayload(this.form));
  }
}
