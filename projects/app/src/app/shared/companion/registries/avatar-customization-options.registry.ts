import {
  AvatarBeardStyleOption,
  AvatarBodyTypeOption,
  AvatarBottomStyleOption,
  AvatarHairStyleOption,
  AvatarSkinToneOption,
  AvatarTopStyleOption,
} from '../models/avatar-customization-options.model';

export const AVATAR_BODY_TYPE_OPTIONS: readonly AvatarBodyTypeOption[] = [
  {
    value: 'BASE_FEMALE',
    label: 'Silhouette douce',
    description: 'Une base équilibrée pour ton compagnon.',
    previewImageUrl: '/characters/placeholder/previews/body/base_female.png',
  },
] as const;

export const AVATAR_SKIN_TONE_OPTIONS: readonly AvatarSkinToneOption[] = [
  {
    value: 'WARM_LIGHT',
    label: 'Clair chaud',
    color: '#f6c7a8',
  },
  {
    value: 'WARM_MEDIUM',
    label: 'Doré',
    color: '#f1ac8e',
  },
  {
    value: 'WARM_DARK',
    label: 'Mat chaud',
    color: '#b87552',
  },
  {
    value: 'NEUTRAL_LIGHT',
    label: 'Clair neutre',
    color: '#e8b99e',
  },
  {
    value: 'NEUTRAL_MEDIUM',
    label: 'Neutre',
    color: '#c98f6f',
  },
  {
    value: 'NEUTRAL_DARK',
    label: 'Foncé neutre',
    color: '#8d5a42',
  },
  {
    value: 'DEEP_BROWN',
    label: 'Profond',
    color: '#6f3f2d',
  },
] as const;

export const AVATAR_HAIR_STYLE_OPTIONS: readonly AvatarHairStyleOption[] = [
  {
    value: 'NONE',
    label: 'Sans cheveux',
    description: 'Un rendu simple et neutre.',
    previewImageUrl: '/characters/placeholder/previews/none.png',
  },
  {
    value: 'LONG_01',
    label: 'Long naturel',
    description: 'Une coupe douce et fluide.',
    previewImageUrl: '/characters/placeholder/previews/hair/long_01.png',
  },
] as const;

export const AVATAR_BEARD_STYLE_OPTIONS: readonly AvatarBeardStyleOption[] = [
  {
    value: 'NONE',
    label: 'Sans barbe',
    description: 'Aucune pilosité faciale.',
    previewImageUrl: '/characters/placeholder/previews/none.png',
  },
] as const;

export const AVATAR_TOP_STYLE_OPTIONS: readonly AvatarTopStyleOption[] = [
  {
    value: 'SHIRT_SWEATER_01',
    label: 'Chemise et pull',
    description: 'Une chemise portée sous un pull pour un style habillé et chaleureux.',
    previewImageUrl: '/characters/placeholder/previews/clothes/top_shirt_01_sweat_01.png',
  },
];

export const AVATAR_BOTTOM_STYLE_OPTIONS: readonly AvatarBottomStyleOption[] = [
  {
    value: 'JEANS_01',
    label: 'Jean',
    description: 'Un jean polyvalent pour ton compagnon.',
    previewImageUrl: '/characters/placeholder/previews/clothes/jeans_01.png',
  },
] as const;
