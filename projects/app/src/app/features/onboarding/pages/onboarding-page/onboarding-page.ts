import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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

  readonly isAvatarStep = computed(() => {
    return this.onboarding.activeStepKey() === 'avatar';
  });

  private readonly shouldGoNextAfterAvatarSave = signal(false);

  private readonly themeService = inject(ThemeService);

  readonly companionConfig = computed(() => {
    return this.avatarStore.companionConfig();
  });

  readonly companionLightingPreset = computed<CompanionLightingPreset>(() => {
    return this.themeService.isDarkTheme() ? 'night-studio' : 'day';
  });

  constructor() {
    effect(() => {
      const saveCompletedAt = this.avatarStore.saveCompletedAt();

      if (!this.shouldGoNextAfterAvatarSave() || !saveCompletedAt) {
        return;
      }

      this.shouldGoNextAfterAvatarSave.set(false);
      this.onboarding.goNext();
    });
  }

  continueCurrentStep(): void {
    if (this.isAvatarStep()) {
      this.continueAvatarStep();
      return;
    }

    this.onboarding.goNext();
  }

  skipAvatarStep(): void {
    this.avatarStore.clearDraft();
    this.onboarding.goNext();
  }

  resetAvatarStep(): void {
    this.avatarStore.resetDraftToDefault();
  }

  private continueAvatarStep(): void {
    if (this.avatarStore.isSaving()) {
      return;
    }

    if (!this.avatarStore.hasDraft()) {
      this.onboarding.goNext();
      return;
    }

    this.shouldGoNextAfterAvatarSave.set(true);
    this.avatarStore.saveDraft();
  }

  readonly isAvatarBusy = computed(() => {
    return (
      this.avatarStore.isLoading() || this.avatarStore.isSaving() || this.avatarStore.isDeleting()
    );
  });

  readonly canContinueCurrentStep = computed(() => {
    if (this.isAvatarStep()) {
      return (
        this.onboarding.canGoNext() &&
        this.avatarStore.draftValid() &&
        !this.isAvatarBusy() &&
        !this.onboarding.isSubmitting()
      );
    }

    return this.onboarding.canGoNext() && !this.onboarding.isSubmitting();
  });

  ngOnInit(): void {
    this.avatarStore.load();
  }
}
