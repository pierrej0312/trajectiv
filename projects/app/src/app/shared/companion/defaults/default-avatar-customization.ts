//valeur fallback métier/UI

import { AvatarCustomizationResponseApiDto } from '@shared-api-client';

import {
  AvatarBodyType,
  AvatarHairStyle,
  AvatarSkinTone,
  AvatarBeardStyle,
  AvatarTopStyle,
  AvatarBottomStyle,
} from '../models/avatar-customization-options.model';

export const DEFAULT_AVATAR_BODY_TYPE: AvatarBodyType = 'BASE_FEMALE';
export const DEFAULT_AVATAR_SKIN_TONE: AvatarSkinTone = 'WARM_MEDIUM';
export const DEFAULT_AVATAR_SKIN_INTENSITY = 0;
export const DEFAULT_AVATAR_HAIR_STYLE: AvatarHairStyle = 'LONG_01';
export const DEFAULT_AVATAR_HAIR_COLOR = '#853e16';
export const DEFAULT_AVATAR_BEARD_STYLE: AvatarBeardStyle = 'NONE';
export const DEFAULT_AVATAR_BEARD_COLOR = '#853e16';

export const DEFAULT_AVATAR_TOP_STYLE: AvatarTopStyle = 'SHIRT_SWEATER_01';
export const DEFAULT_AVATAR_BOTTOM_STYLE: AvatarBottomStyle = 'JEANS_01';

export const DEFAULT_AVATAR_CUSTOMIZATION: AvatarCustomizationResponseApiDto = {
  bodyType: DEFAULT_AVATAR_BODY_TYPE,
  skinTone: DEFAULT_AVATAR_SKIN_TONE,
  skinIntensity: DEFAULT_AVATAR_SKIN_INTENSITY,
  hairStyle: DEFAULT_AVATAR_HAIR_STYLE,
  hairColor: DEFAULT_AVATAR_HAIR_COLOR,
  beardStyle: DEFAULT_AVATAR_BEARD_STYLE,
  beardColor: DEFAULT_AVATAR_BEARD_COLOR,
  topStyle: DEFAULT_AVATAR_TOP_STYLE,
  bottomStyle: DEFAULT_AVATAR_BOTTOM_STYLE,
};
