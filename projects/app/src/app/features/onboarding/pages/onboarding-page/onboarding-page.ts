import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

import { AppContextStore } from '@core';
import { ThemeService } from '@themes/theme.service';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { CompanionStageComponent } from '@shared/companion/components/companion-stage/companion-stage';
import { CompanionLightingPreset } from '@shared/companion/models/companion-animation.model';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';

@Component({
  selector: 'app-onboarding-page',
  imports: [RouterOutlet, ButtonDirective, CompanionStageComponent],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage implements OnInit {
  readonly onboarding = inject(OnboardingStore);
  readonly appContext = inject(AppContextStore);
  readonly avatarStore = inject(AvatarCustomizationStore);

  private readonly themeService = inject(ThemeService);

  readonly companionConfig = computed(() => {
    return this.avatarStore.companionConfig();
  });

  readonly companionLightingPreset = computed<CompanionLightingPreset>(() => {
    return this.themeService.isDarkTheme() ? 'night-studio' : 'day';
  });

  ngOnInit(): void {
    this.avatarStore.load();
  }
}
