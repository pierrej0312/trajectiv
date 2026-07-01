import { AvatarCustomizationResponseApiDto } from '@shared-api-client';

type BodyType = NonNullable<AvatarCustomizationResponseApiDto['bodyType']>;
type SkinTone = NonNullable<AvatarCustomizationResponseApiDto['skinTone']>;
type HairStyle = NonNullable<AvatarCustomizationResponseApiDto['hairStyle']>;

export const AVATAR_BODY_MODEL_URL_BY_TYPE: Record<BodyType, string> = {
  BASE_FEMALE: '/characters/placeholder/BASEmodel_female.glb',
};

export const AVATAR_SKIN_BASE_COLOR_BY_TONE: Record<SkinTone, string> = {
  WARM_LIGHT: '#f6c7a8',
  WARM_MEDIUM: '#f1ac8e',
  WARM_DARK: '#b87552',
  NEUTRAL_LIGHT: '#e8b99e',
  NEUTRAL_MEDIUM: '#c98f6f',
  NEUTRAL_DARK: '#8d5a42',
  DEEP_BROWN: '#6f3f2d',
};

export const AVATAR_HAIR_MODEL_URL_BY_STYLE: Record<HairStyle, string> = {
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
