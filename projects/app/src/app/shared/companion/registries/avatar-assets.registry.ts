import {
  AvatarBodyType,
  AvatarBottomStyle,
  AvatarHairStyle,
  AvatarSkinTone,
  AvatarTopStyle,
} from '../models/avatar-customization-options.model';
import { AVATAR_SKIN_TONE_OPTIONS } from './avatar-customization-options.registry';
import { CompanionClothingAsset } from '@shared/companion/models/companion-animation.model';

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

export const AVATAR_FEMALE_CLOTHES_MODEL_URL =
  '/characters/placeholder/clothes/female_clothes_01.glb';

export type AvatarClothingMaterialType = 'cotton' | 'knit' | 'denim';

export interface AvatarClothingAsset {
  readonly meshName: string;
  readonly colorMapUrl: string;
  readonly materialType: AvatarClothingMaterialType;
}

export const AVATAR_TOP_ASSET_BY_STYLE: Record<AvatarTopStyle, CompanionClothingAsset> = {
  SHIRT_SWEATER_01: {
    meshes: [
      {
        meshName: 'chemise',
        colorMapUrl: '/characters/placeholder/clothes/chemise_femme.png',
        materialType: 'cotton',
      },
      {
        meshName: 'pull',
        colorMapUrl: '/characters/placeholder/clothes/pull.png',
        materialType: 'knit',
      },
    ],
  },
};

export const AVATAR_BOTTOM_ASSET_BY_STYLE: Record<AvatarBottomStyle, CompanionClothingAsset> = {
  JEANS_01: {
    meshes: [
      {
        meshName: 'pant',
        colorMapUrl: '/characters/placeholder/clothes/pant_female.png',
        materialType: 'denim',
      },
    ],
  },
};

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

  excited: '/characters/placeholder/animations/excited.glb',
  lookAround: '/characters/placeholder/animations/look_arround.glb',
  surprised: '/characters/placeholder/animations/surprised.glb',
  talkingPhone: '/characters/placeholder/animations/talking_phone.glb',
  searchPocket: {
    url: '/characters/placeholder/animations/search_pocket.glb',
    clipIndex: 1,
  },
  thinking: '/characters/placeholder/animations/thinking.glb',
} as const;
