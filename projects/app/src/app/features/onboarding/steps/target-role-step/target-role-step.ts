import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';

import { OnboardingStore } from '../../store/onboarding.store';

@Component({
  selector: 'app-target-role-step',
  standalone: true,
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PanelModule,
    TagModule,
  ],
  templateUrl: './target-role-step.html',
  styleUrl: './target-role-step.css',
})
export class TargetRoleStep {
  protected readonly store = inject(OnboardingStore);
}
