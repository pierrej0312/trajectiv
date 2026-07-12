import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';

import { Panel } from 'primeng/panel';
import { Slider } from 'primeng/slider';

import {
  avatarStepFormToCreatePayload,
  createAvatarStepForm,
  patchAvatarStepFormFromCustomization,
} from '@features/onboarding/steps/avatar-step/avatar-step.form';

import {
  AvatarBeardStyle,
  AvatarBodyType,
  AvatarBottomStyle,
  AvatarHairStyle,
  AvatarSkinTone,
  AvatarTopStyle,
} from '@shared/companion/models/avatar-customization-options.model';

import {
  AVATAR_BEARD_STYLE_OPTIONS,
  AVATAR_BODY_TYPE_OPTIONS,
  AVATAR_BOTTOM_STYLE_OPTIONS,
  AVATAR_HAIR_STYLE_OPTIONS,
  AVATAR_SKIN_TONE_OPTIONS,
  AVATAR_TOP_STYLE_OPTIONS,
} from '@shared/companion/registries/avatar-customization-options.registry';

import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';
import { SelectableOptionCard } from '@shared/components/selectable-option-card/selectable-option-card';

@Component({
  selector: 'app-avatar-step',
  imports: [Panel, ReactiveFormsModule, Slider, SelectableOptionCard],
  templateUrl: './avatar-step.html',
  styleUrl: './avatar-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarStep {
  readonly avatarStore = inject(AvatarCustomizationStore);

  private readonly destroyRef = inject(DestroyRef);

  readonly form = createAvatarStepForm();

  readonly bodyTypeOptions = AVATAR_BODY_TYPE_OPTIONS;

  readonly skinToneOptions = AVATAR_SKIN_TONE_OPTIONS;

  readonly hairStyleOptions = AVATAR_HAIR_STYLE_OPTIONS;

  readonly beardStyleOptions = AVATAR_BEARD_STYLE_OPTIONS;

  readonly topStyleOptions = AVATAR_TOP_STYLE_OPTIONS;

  readonly bottomStyleOptions = AVATAR_BOTTOM_STYLE_OPTIONS;

  private isPatchingForm = false;

  constructor() {
    effect(() => {
      const customization = this.avatarStore.effectiveCustomization();

      this.isPatchingForm = true;

      patchAvatarStepFormFromCustomization(this.form, customization, {
        emitEvent: false,
      });

      this.avatarStore.setDraftValidity(this.form.valid);

      this.isPatchingForm = false;
    });

    this.form.valueChanges
      .pipe(
        tap(() => {
          if (this.isPatchingForm) {
            return;
          }

          this.avatarStore.setDraftValidity(this.form.valid);

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

  selectTopStyle(value: AvatarTopStyle): void {
    this.form.controls.topStyle.setValue(value);
    this.form.controls.topStyle.markAsDirty();
  }

  selectBottomStyle(value: AvatarBottomStyle): void {
    this.form.controls.bottomStyle.setValue(value);
    this.form.controls.bottomStyle.markAsDirty();
  }
}
