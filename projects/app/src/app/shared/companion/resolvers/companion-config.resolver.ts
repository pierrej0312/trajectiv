//transformation avatar DTO → config 3D
import { AvatarCustomizationResponseApiDto } from '@shared-api-client';

import { CompanionAnimationConfig } from '../../companion/models/companion-animation.model';
import {
  DEFAULT_AVATAR_BODY_TYPE,
  DEFAULT_AVATAR_BOTTOM_STYLE,
  DEFAULT_AVATAR_CUSTOMIZATION,
  DEFAULT_AVATAR_HAIR_COLOR,
  DEFAULT_AVATAR_HAIR_STYLE,
  DEFAULT_AVATAR_SKIN_INTENSITY,
  DEFAULT_AVATAR_SKIN_TONE,
  DEFAULT_AVATAR_TOP_STYLE,
} from '../defaults/default-avatar-customization';
import {
  AVATAR_BODY_MODEL_URL_BY_TYPE,
  AVATAR_BOTTOM_ASSET_BY_STYLE,
  AVATAR_FEMALE_CLOTHES_MODEL_URL,
  AVATAR_HAIR_MODEL_URL_BY_STYLE,
  AVATAR_HAIR_TEXTURES,
  AVATAR_SKIN_BASE_COLOR_BY_TONE,
  AVATAR_SKIN_TEXTURES,
  AVATAR_TOP_ASSET_BY_STYLE,
  DEFAULT_COMPANION_ANIMATIONS,
} from '../registries/avatar-assets.registry';

export function resolveCompanionConfig(
  customization: AvatarCustomizationResponseApiDto | null | undefined,
): CompanionAnimationConfig {
  const safeCustomization = customization ?? DEFAULT_AVATAR_CUSTOMIZATION;

  const bodyType = safeCustomization.bodyType ?? DEFAULT_AVATAR_BODY_TYPE;
  const skinTone = safeCustomization.skinTone ?? DEFAULT_AVATAR_SKIN_TONE;
  const hairStyle = safeCustomization.hairStyle ?? DEFAULT_AVATAR_HAIR_STYLE;
  const skinIntensity = safeCustomization.skinIntensity ?? DEFAULT_AVATAR_SKIN_INTENSITY;
  const hairColor = safeCustomization.hairColor ?? DEFAULT_AVATAR_HAIR_COLOR;
  const topStyle = safeCustomization.topStyle ?? DEFAULT_AVATAR_TOP_STYLE;

  const bottomStyle = safeCustomization.bottomStyle ?? DEFAULT_AVATAR_BOTTOM_STYLE;

  const topAsset = AVATAR_TOP_ASSET_BY_STYLE[topStyle];

  const bottomAsset = AVATAR_BOTTOM_ASSET_BY_STYLE[bottomStyle];

  return {
    modelUrl: AVATAR_BODY_MODEL_URL_BY_TYPE[bodyType],
    skin: {
      color: resolveSkinColor(AVATAR_SKIN_BASE_COLOR_BY_TONE[skinTone], skinIntensity),
      detailMapUrl: AVATAR_SKIN_TEXTURES.detailMapUrl,
      normalMapUrl: AVATAR_SKIN_TEXTURES.normalMapUrl,
      roughnessMapUrl: AVATAR_SKIN_TEXTURES.roughnessMapUrl,
      debug: false,
    },
    hair: {
      url: AVATAR_HAIR_MODEL_URL_BY_STYLE[hairStyle],
      color: hairColor,
      detailMapUrl: AVATAR_HAIR_TEXTURES.detailMapUrl,
      normalMapUrl: AVATAR_HAIR_TEXTURES.normalMapUrl,
      roughnessMapUrl: AVATAR_HAIR_TEXTURES.roughnessMapUrl,
      attachTo: 'head',
      debug: false,
    },
    clothes: {
      url: AVATAR_FEMALE_CLOTHES_MODEL_URL,
      items: [
        {
          style: topStyle,
          ...topAsset,
        },
        {
          style: bottomStyle,
          ...bottomAsset,
        },
      ],
    },
    framing: 'full-body',
    intro: {
      animation: 'landing',
      fallback: 'idle',
    },
    animations: DEFAULT_COMPANION_ANIMATIONS,
  };
}

function resolveSkinColor(baseColor: string, intensity: number): string {
  if (intensity === 0) {
    return baseColor;
  }

  return baseColor;
}
