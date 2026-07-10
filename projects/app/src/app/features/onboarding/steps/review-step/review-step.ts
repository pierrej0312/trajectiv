import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';

import { AppContextStore } from '@core';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [ButtonDirective, PanelModule, TagModule],
  templateUrl: './review-step.html',
  styleUrl: './review-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewStep {
  protected readonly onboarding = inject(OnboardingStore);
  protected readonly appContext = inject(AppContextStore);
  protected readonly avatarStore = inject(AvatarCustomizationStore);

  protected readonly avatarImageUrl = computed(() => {
    return this.avatarStore.avatarPreviewUrl() ?? this.appContext.avatarUrl() ?? null;
  });

  protected readonly displayName = computed(() => {
    return this.appContext.displayName?.() || this.onboarding.displayName() || 'Ton profil';
  });

  protected readonly email = computed(() => {
    return this.appContext.email?.() ?? '';
  });

  protected readonly initials = computed(() => {
    return this.appContext.initials?.() ?? this.displayName().slice(0, 2).toUpperCase();
  });

  protected readonly isReady = computed(() => {
    return this.onboarding.canComplete();
  });

  protected goToAvatar(): void {
    this.onboarding.goToRoute('/app/onboarding/avatar');
  }

  protected goToGoal(): void {
    this.onboarding.goToRoute('/app/onboarding/goal');
  }

  protected goToTargetRole(): void {
    this.onboarding.goToRoute('/app/onboarding/target-role');
  }

  protected goToExperienceLevel(): void {
    this.onboarding.goToRoute('/app/onboarding/experience-level');
  }
}
