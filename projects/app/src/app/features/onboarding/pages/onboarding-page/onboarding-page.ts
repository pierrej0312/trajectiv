import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

import { AppContextStore } from '@core';
import { ThemeService } from '@themes/theme.service';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { CompanionStageComponent } from '@shared/companion/components/companion-stage/companion-stage';
import {
  CompanionAnimationConfig,
  CompanionLightingPreset,
} from '@shared/companion/models/companion-animation.model';

@Component({
  selector: 'app-onboarding-page',
  imports: [RouterOutlet, ButtonDirective, CompanionStageComponent],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage {
  readonly onboarding = inject(OnboardingStore);
  readonly appContext = inject(AppContextStore);

  private readonly themeService = inject(ThemeService);

  readonly companionConfig: CompanionAnimationConfig = {
    modelUrl: '/characters/placeholder/BASEmodel_female.glb',
    skin: {
      color: '#c49377',
      detailMapUrl: '/characters/placeholder/skin/female_skin_detail.png',
      normalMapUrl: '/characters/placeholder/skin/female_skin_normal.png',
      roughnessMapUrl: '/characters/placeholder/skin/female_skin_roughness.png',
      debug: true,
    },
    hair: {
      url: '/characters/placeholder/hair/hair_long_01.glb',
      color: '#3f250b',
      detailMapUrl: '/characters/placeholder/hair/hair_long_01_detail.png',
      normalMapUrl: '/characters/placeholder/hair/hair_long_01_normal.png',
      roughnessMapUrl: '/characters/placeholder/hair/hair_long_01_roughness.png',
      attachTo: 'head',
      debug: true,
    },
    framing: 'full-body',
    intro: {
      animation: 'landing',
      fallback: 'idle',
    },
    animations: {
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
    },
  };

  readonly companionLightingPreset = computed<CompanionLightingPreset>(() => {
    return this.themeService.isDarkTheme() ? 'night-studio' : 'day';
  });
}
