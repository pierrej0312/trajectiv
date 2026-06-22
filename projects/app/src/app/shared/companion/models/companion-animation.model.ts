export type CompanionAnimationName = 'idle' | 'victory' | 'levelUp' | 'levelDown' | 'dancing';

export type CompanionMood = 'idle' | 'focused' | 'levelUp' | 'levelDown' | 'victory' | 'ready';

export interface CompanionAnimationConfig {
  readonly modelUrl: string;
  readonly animations: Record<CompanionAnimationName, string>;
}

export interface CompanionAnimationCommand {
  readonly id: number;
  readonly name: CompanionAnimationName;
  readonly mode: 'loop' | 'once';
  readonly fallback?: CompanionAnimationName;
}
export type CompanionStageFraming = 'full-body' | 'portrait' | 'hero';

export interface CompanionAnimationConfig {
  readonly modelUrl: string;
  readonly animations: Record<CompanionAnimationName, string>;
  readonly framing?: CompanionStageFraming;
  readonly lightingPreset?: CompanionLightingPreset;
}
export type CompanionLightingPreset = 'day' | 'night-studio';
