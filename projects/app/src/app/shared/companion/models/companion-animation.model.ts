export type CompanionAnimationName =
  | 'landing'
  | 'idle'
  | 'victory'
  | 'levelUp'
  | 'levelDown'
  | 'dancing'
  | 'excited'
  | 'lookAround'
  | 'surprised'
  | 'talkingPhone'
  | 'searchPocket'
  | 'thinking';

export type CompanionMood = 'idle' | 'focused' | 'levelUp' | 'levelDown' | 'victory' | 'ready';

export interface CompanionAnimationCommand {
  readonly id: number;
  readonly name: CompanionAnimationName;
  readonly mode: 'loop' | 'once';
  readonly fallback?: CompanionAnimationName;
}

export type CompanionStageFraming = 'full-body' | 'portrait' | 'hero';

export interface CompanionHairConfig {
  readonly url: string;
  readonly color?: string;
  readonly detailMapUrl?: string;
  readonly normalMapUrl?: string;
  readonly roughnessMapUrl?: string;
  readonly attachTo?: 'head' | 'model';
  readonly debug?: boolean;
}

export interface CompanionSkinConfig {
  readonly color: string;
  readonly detailMapUrl?: string;
  readonly normalMapUrl?: string;
  readonly roughnessMapUrl?: string;
  readonly debug?: boolean;
}

export interface CompanionIntroConfig {
  readonly animation: CompanionAnimationName;
  readonly fallback?: CompanionAnimationName;
}

export type CompanionAnimationSource =
  | string
  | {
      readonly url: string;
      readonly clipIndex?: number;
      readonly clipName?: string;
    };

export type CompanionLightingPreset = 'day' | 'night-studio';

export type CompanionClothesSlot = 'top' | 'bottom';

export type CompanionClothesMaterialType = 'cotton' | 'knit' | 'denim';

export interface CompanionClothingMeshAsset {
  readonly meshName: string;
  readonly colorMapUrl: string;
  readonly materialType: CompanionClothesMaterialType;
  readonly color?: string;
}

export interface CompanionClothingAsset {
  readonly meshes: readonly CompanionClothingMeshAsset[];
}

export interface CompanionClothingItemConfig extends CompanionClothingAsset {
  readonly style: string;
}

export interface CompanionClothesConfig {
  readonly url: string;
  readonly items: readonly CompanionClothingItemConfig[];
}

export interface CompanionAnimationConfig {
  readonly modelUrl: string;
  readonly animations: Record<CompanionAnimationName, CompanionAnimationSource>;
  readonly framing?: CompanionStageFraming;
  readonly lightingPreset?: CompanionLightingPreset;
  readonly hair?: CompanionHairConfig;
  readonly skin?: CompanionSkinConfig;
  readonly clothes: CompanionClothesConfig;
  readonly intro?: CompanionIntroConfig;
}
