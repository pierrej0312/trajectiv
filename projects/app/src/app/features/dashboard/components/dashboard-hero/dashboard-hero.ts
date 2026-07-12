import { Component, computed, inject, input } from '@angular/core';
import { DashboardHeroVm } from '@features/dashboard/models/dashboard.model';
import { CompanionStageComponent } from '@shared/companion/components/companion-stage/companion-stage';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';
import {
  CompanionAnimationCommand,
  CompanionLightingPreset,
} from '@shared/companion/models/companion-animation.model';
import { ThemeService } from '@themes/theme.service';

@Component({
  selector: 'app-dashboard-hero',
  imports: [CompanionStageComponent],
  templateUrl: './dashboard-hero.html',
  styleUrl: './dashboard-hero.css',
})
export class DashboardHero {
  readonly hero = input.required<DashboardHeroVm>();
  readonly avatarStore = inject(AvatarCustomizationStore);
  readonly themeService = inject(ThemeService);

  protected readonly companionConfig = this.avatarStore.companionConfig;

  protected readonly companionLightingPreset = computed<CompanionLightingPreset>(() => {
    return this.themeService.isDarkTheme() ? 'day' : 'day';
  });

  protected readonly idleCommand: CompanionAnimationCommand = {
    id: 0,
    name: 'idle',
    mode: 'loop',
  };

  ngOnInit(): void {
    this.loadAvatarCustomization();
  }

  private loadAvatarCustomization(): void {
    if (!this.avatarStore.isIdle()) {
      return;
    }

    this.avatarStore.load();
  }
}
