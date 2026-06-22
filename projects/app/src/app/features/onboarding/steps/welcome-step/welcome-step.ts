import { Component, inject } from '@angular/core';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { AppContextStore } from '@core';

@Component({
  selector: 'app-welcome-step',
  imports: [],
  templateUrl: './welcome-step.html',
  styleUrl: './welcome-step.css',
})
export class WelcomeStep {
  readonly appContext = inject(AppContextStore);
  readonly onboarding = inject(OnboardingStore);

  start(): void {
    this.onboarding.goNext();
  }
}
