import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  AvatarCustomizationResponseApiDto,
  CreateAvatarCustomizationRequestApiDto,
  PatchAvatarCustomizationRequestApiDto,
} from '@shared-api-client';

import {
  DEFAULT_AVATAR_BEARD_COLOR,
  DEFAULT_AVATAR_BEARD_STYLE,
  DEFAULT_AVATAR_BODY_TYPE,
  DEFAULT_AVATAR_BOTTOM_STYLE,
  DEFAULT_AVATAR_HAIR_COLOR,
  DEFAULT_AVATAR_HAIR_STYLE,
  DEFAULT_AVATAR_SKIN_INTENSITY,
  DEFAULT_AVATAR_SKIN_TONE,
  DEFAULT_AVATAR_TOP_STYLE,
} from '@shared/companion/defaults/default-avatar-customization';

import {
  AvatarBeardStyle,
  AvatarBodyType,
  AvatarBottomStyle,
  AvatarHairStyle,
  AvatarSkinTone,
  AvatarTopStyle,
} from '@shared/companion/models/avatar-customization-options.model';

export type AvatarStepForm = FormGroup<{
  bodyType: FormControl<AvatarBodyType>;
  skinTone: FormControl<AvatarSkinTone>;
  skinIntensity: FormControl<number>;

  hairStyle: FormControl<AvatarHairStyle>;
  hairColor: FormControl<string>;

  beardStyle: FormControl<AvatarBeardStyle>;
  beardColor: FormControl<string>;

  topStyle: FormControl<AvatarTopStyle>;
  bottomStyle: FormControl<AvatarBottomStyle>;
}>;

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function createAvatarStepForm(): AvatarStepForm {
  return new FormGroup({
    bodyType: new FormControl<AvatarBodyType>(DEFAULT_AVATAR_BODY_TYPE, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    skinTone: new FormControl<AvatarSkinTone>(DEFAULT_AVATAR_SKIN_TONE, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    skinIntensity: new FormControl<number>(DEFAULT_AVATAR_SKIN_INTENSITY, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(-2), Validators.max(2)],
    }),

    hairStyle: new FormControl<AvatarHairStyle>(DEFAULT_AVATAR_HAIR_STYLE, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    hairColor: new FormControl<string>(DEFAULT_AVATAR_HAIR_COLOR, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)],
    }),

    beardStyle: new FormControl<AvatarBeardStyle>(DEFAULT_AVATAR_BEARD_STYLE, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    beardColor: new FormControl<string>(DEFAULT_AVATAR_BEARD_COLOR, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)],
    }),

    topStyle: new FormControl<AvatarTopStyle>(DEFAULT_AVATAR_TOP_STYLE, {
      nonNullable: true,
      validators: [Validators.required],
    }),

    bottomStyle: new FormControl<AvatarBottomStyle>(DEFAULT_AVATAR_BOTTOM_STYLE, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
}

export function patchAvatarStepFormFromCustomization(
  form: AvatarStepForm,
  customization: AvatarCustomizationResponseApiDto,
  options: { emitEvent?: boolean } = {},
): void {
  form.patchValue(
    {
      bodyType: customization.bodyType ?? DEFAULT_AVATAR_BODY_TYPE,

      skinTone: customization.skinTone ?? DEFAULT_AVATAR_SKIN_TONE,

      skinIntensity: customization.skinIntensity ?? DEFAULT_AVATAR_SKIN_INTENSITY,

      hairStyle: customization.hairStyle ?? DEFAULT_AVATAR_HAIR_STYLE,

      hairColor: customization.hairColor ?? DEFAULT_AVATAR_HAIR_COLOR,

      beardStyle: customization.beardStyle ?? DEFAULT_AVATAR_BEARD_STYLE,

      beardColor: customization.beardColor ?? DEFAULT_AVATAR_BEARD_COLOR,

      topStyle: customization.topStyle ?? DEFAULT_AVATAR_TOP_STYLE,

      bottomStyle: customization.bottomStyle ?? DEFAULT_AVATAR_BOTTOM_STYLE,
    },
    {
      emitEvent: options.emitEvent ?? true,
    },
  );
}

export function avatarStepFormToCreatePayload(
  form: AvatarStepForm,
): CreateAvatarCustomizationRequestApiDto {
  const value = form.getRawValue();

  return {
    bodyType: value.bodyType,
    skinTone: value.skinTone,
    skinIntensity: value.skinIntensity,

    hairStyle: value.hairStyle,
    hairColor: value.hairColor,

    beardStyle: value.beardStyle,
    beardColor: value.beardColor,

    topStyle: value.topStyle,
    bottomStyle: value.bottomStyle,
  };
}

export function avatarStepFormToPatchPayload(
  form: AvatarStepForm,
): PatchAvatarCustomizationRequestApiDto {
  const value = form.getRawValue();

  return {
    bodyType: value.bodyType,
    skinTone: value.skinTone,
    skinIntensity: value.skinIntensity,

    hairStyle: value.hairStyle,
    hairColor: value.hairColor,

    beardStyle: value.beardStyle,
    beardColor: value.beardColor,

    topStyle: value.topStyle,
    bottomStyle: value.bottomStyle,
  };
}
