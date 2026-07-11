import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ButtonDirective } from 'primeng/button';

import { TrajectivBlobLoader } from '@shared-ui';

import { OnboardingCompletionPhase } from '../../store/onboarding.store';

@Component({
  selector: 'app-onboarding-completion-overlay',
  imports: [ButtonDirective, TrajectivBlobLoader],
  templateUrl: './onboarding-completion-overlay.html',
  styleUrl: './onboarding-completion-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingCompletionOverlay {
  readonly phase = input.required<OnboardingCompletionPhase>();

  readonly message = input.required<string>();

  readonly showRetry = input(false);

  readonly retry = output<void>();
  readonly closeError = output<void>();

  readonly isSuccess = computed(() => {
    return this.phase() === 'success';
  });

  readonly isError = computed(() => {
    return this.phase() === 'error';
  });

  readonly loaderCompleted = computed(() => {
    return this.isSuccess();
  });
}
