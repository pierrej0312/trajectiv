export type CompanionAnimationName =
  | 'landing'
  | 'idle'
  | 'victory'
  | 'levelUp'
  | 'levelDown'
  | 'dancing';

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

export const AVATAR_SKIN_PRESETS = [
  { id: 'SKIN_01', label: 'Clair', color: '#F0C7AA' },
  { id: 'SKIN_02', label: 'Doré', color: '#D8A071' },
  { id: 'SKIN_03', label: 'Mat', color: '#B87552' },
  { id: 'SKIN_04', label: 'Foncé', color: '#7A4A35' },
  { id: 'SKIN_05', label: 'Profond', color: '#4A2C22' },
] as const;
