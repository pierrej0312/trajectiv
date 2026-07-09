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

export interface CompanionAnimationConfig {
  readonly modelUrl: string;
  readonly animations: Record<CompanionAnimationName, CompanionAnimationSource>;
  readonly framing?: CompanionStageFraming;
  readonly lightingPreset?: CompanionLightingPreset;
  readonly hair?: CompanionHairConfig;
  readonly skin?: CompanionSkinConfig;
  readonly intro?: CompanionIntroConfig;
}

export type CompanionAnimationSource =
  | string
  | {
      readonly url: string;
      readonly clipIndex?: number;
      readonly clipName?: string;
    };

export type CompanionLightingPreset = 'day' | 'night-studio';
