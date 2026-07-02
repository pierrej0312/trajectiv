import { AvatarCustomizationResponseApiDto } from '@shared-api-client';

export type AvatarBodyType = NonNullable<AvatarCustomizationResponseApiDto['bodyType']>;
export type AvatarSkinTone = NonNullable<AvatarCustomizationResponseApiDto['skinTone']>;
export type AvatarHairStyle = NonNullable<AvatarCustomizationResponseApiDto['hairStyle']>;
export type AvatarBeardStyle = NonNullable<AvatarCustomizationResponseApiDto['beardStyle']>;

export type AvatarColorHex = `#${string}`;

export interface AvatarCardOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  readonly description?: string;
  readonly previewImageUrl: string;
}

export interface AvatarSkinToneOption {
  readonly value: AvatarSkinTone;
  readonly label: string;
  readonly color: AvatarColorHex;
}

export type AvatarBodyTypeOption = AvatarCardOption<AvatarBodyType>;
export type AvatarHairStyleOption = AvatarCardOption<AvatarHairStyle>;
export type AvatarBeardStyleOption = AvatarCardOption<AvatarBeardStyle>;
