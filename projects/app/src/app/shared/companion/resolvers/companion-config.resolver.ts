import { AvatarCustomizationResponseApiDto } from '@shared-api-client';

import { CompanionAnimationConfig } from '../../companion/models/companion-animation.model';
import { DEFAULT_AVATAR_CUSTOMIZATION } from '../defaults/default-avatar-customization';
import {
  AVATAR_BODY_MODEL_URL_BY_TYPE,
  AVATAR_HAIR_MODEL_URL_BY_STYLE,
  AVATAR_HAIR_TEXTURES,
  AVATAR_SKIN_BASE_COLOR_BY_TONE,
  AVATAR_SKIN_TEXTURES,
  DEFAULT_COMPANION_ANIMATIONS,
} from '../registries/avatar-assets.registry';

export function resolveCompanionConfig(
  customization: AvatarCustomizationResponseApiDto | null | undefined,
): CompanionAnimationConfig {
  const safeCustomization = customization ?? DEFAULT_AVATAR_CUSTOMIZATION;

  return {
    modelUrl: AVATAR_BODY_MODEL_URL_BY_TYPE[safeCustomization.bodyType ?? "BASE_FEMALE"],
    skin: {
      color: resolveSkinColor(
        AVATAR_SKIN_BASE_COLOR_BY_TONE[safeCustomization.skinTone ?? "NEUTRAL_MEDIUM"],
        safeCustomization.skinIntensity ?? 0,
      ),
      detailMapUrl: AVATAR_SKIN_TEXTURES.detailMapUrl,
      normalMapUrl: AVATAR_SKIN_TEXTURES.normalMapUrl,
      roughnessMapUrl: AVATAR_SKIN_TEXTURES.roughnessMapUrl,
      debug: false,
    },
    hair: {
      url: AVATAR_HAIR_MODEL_URL_BY_STYLE[safeCustomization.hairStyle ?? "LONG_01"],
      color: safeCustomization.hairColor ?? DEFAULT_AVATAR_CUSTOMIZATION.hairColor,
      detailMapUrl: AVATAR_HAIR_TEXTURES.detailMapUrl,
      normalMapUrl: AVATAR_HAIR_TEXTURES.normalMapUrl,
      roughnessMapUrl: AVATAR_HAIR_TEXTURES.roughnessMapUrl,
      attachTo: 'head',
      debug: false,
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
