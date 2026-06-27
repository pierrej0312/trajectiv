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
    hairUrl: '/characters/placeholder/hair/hair_long_01.glb',
    framing: 'full-body',
    animations: {
      idle: '/characters/placeholder/animations/idle_female.glb',
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
