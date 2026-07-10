import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { TrajectivBlobLoader } from '@shared-ui';
import { AppContextStore } from '@core';

import { RouterLoadingStore } from '@app/src/app/core/navigation/router-loading.store';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TrajectivBlobLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly appContext = inject(AppContextStore);
  readonly routerLoading = inject(RouterLoadingStore);
  readonly avatarStore = inject(AvatarCustomizationStore);

  /**
   * Une fois le bootstrap terminé, le loader global
   * ne doit plus jamais se rouvrir pendant cette session.
   */
  readonly bootstrapCompleted = signal(false);

  /**
   * Le composant reste monté pendant l’animation finale.
   */
  readonly loaderVisible = signal(true);

  /**
   * Temporaire pour travailler visuellement sur le loader.
   */
  private readonly loaderDebugEnabled = false;
  private readonly loaderDebugDurationMs = 8_000;

  private readonly debugMinimumLoadingElapsed = signal(!this.loaderDebugEnabled);

  readonly bootstrapLoading = computed(() => {
    if (this.bootstrapCompleted()) {
      return false;
    }

    if (this.routerLoading.isAuthBridgePage()) {
      return false;
    }

    const debugDelayActive = !this.debugMinimumLoadingElapsed();

    const userContextLoading = this.appContext.isIdle() || this.appContext.isLoading();

    /**
     * On attend seulement la navigation initiale.
     * Dès que le bootstrap sera terminé, ce signal
     * ne pourra plus rouvrir le loader.
     */
    const initialNavigationLoading = this.routerLoading.isNavigating();

    /**
     * Si la destination initiale est l’onboarding,
     * on attend aussi la configuration du companion.
     */
    const onboardingConfigurationLoading =
      this.routerLoading.isOnboardingNavigation() &&
      (this.avatarStore.isIdle() || this.avatarStore.isLoading());

    return (
      debugDelayActive ||
      userContextLoading ||
      initialNavigationLoading ||
      onboardingConfigurationLoading
    );
  });

  readonly loaderCompleted = computed(() => {
    return !this.bootstrapLoading();
  });

  constructor() {
    if (this.loaderDebugEnabled) {
      window.setTimeout(() => {
        this.debugMinimumLoadingElapsed.set(true);
      }, this.loaderDebugDurationMs);
    }

    effect(() => {
      if (this.bootstrapCompleted()) {
        return;
      }

      if (this.bootstrapLoading()) {
        this.loaderVisible.set(true);
      }
    });
  }

  onLoaderSettled(): void {
    if (this.bootstrapLoading()) {
      return;
    }

    this.bootstrapCompleted.set(true);
    this.loaderVisible.set(false);
  }
}
