import {
  AvatarBodyType,
  AvatarHairStyle,
  AvatarSkinTone,
} from '../models/avatar-customization-options.model';
import { AVATAR_SKIN_TONE_OPTIONS } from './avatar-customization-options.registry';

//mapping technique choix → assets 3D/textures

export const AVATAR_BODY_MODEL_URL_BY_TYPE: Record<AvatarBodyType, string> = {
  BASE_FEMALE: '/characters/placeholder/BASEmodel_female.glb',
};

export const AVATAR_SKIN_BASE_COLOR_BY_TONE: Record<AvatarSkinTone, string> = Object.fromEntries(
  AVATAR_SKIN_TONE_OPTIONS.map((option) => [option.value, option.color]),
) as Record<AvatarSkinTone, string>;

export const AVATAR_HAIR_MODEL_URL_BY_STYLE: Record<AvatarHairStyle, string> = {
  NONE: '/characters/placeholder/hair/hair_long_01.glb',
  LONG_01: '/characters/placeholder/hair/hair_long_01.glb',
};

export const AVATAR_SKIN_TEXTURES = {
  detailMapUrl: '/characters/placeholder/skin/female_skin_detail.png',
  normalMapUrl: '/characters/placeholder/skin/female_skin_normal.png',
  roughnessMapUrl: '/characters/placeholder/skin/female_skin_roughness.png',
} as const;

export const AVATAR_HAIR_TEXTURES = {
  detailMapUrl: '/characters/placeholder/hair/hair_long_01_detail.png',
  normalMapUrl: '/characters/placeholder/hair/hair_long_01_normal.png',
  roughnessMapUrl: '/characters/placeholder/hair/hair_long_01_roughness.png',
} as const;

export const DEFAULT_COMPANION_ANIMATIONS = {
  landing: {
    url: '/characters/placeholder/animations/landing.glb',
    clipIndex: 0,
  },
  idle: {
    url: '/characters/placeholder/animations/idle_female.glb',
    clipIndex: 3,
  },
  victory: '/characters/placeholder/animations/victory_female.glb',
  levelUp: '/characters/placeholder/animations/level-up_female.glb',
  levelDown: '/characters/placeholder/animations/level-down_female.glb',
  dancing: '/characters/placeholder/animations/dancing.glb',
} as const;
