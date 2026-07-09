import { Component, inject } from '@angular/core';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { MeterGroupModule } from 'primeng/metergroup';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-experience-level-step',
  imports: [ButtonModule, MeterGroupModule, PanelModule, TagModule],
  templateUrl: './experience-level-step.html',
  styleUrl: './experience-level-step.css',
})
export class ExperienceLevelStep {
  protected readonly onboarding = inject(OnboardingStore);
}
