import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';

import { SignUpFormService } from '../../services/sign-up-form.service';
import { SignUpTargetStep } from '@features/auth/components/sign-up/sign-up-target-step/sign-up-target-step';
import { SignUpAccountStep } from '@features/auth/components/sign-up/sign-up-account-step/sign-up-account-step';
import { SignUpConfirmStep } from '@features/auth/components/sign-up/sign-up-confirm-step/sign-up-confirm-step';
import { RouterLink } from '@angular/router';
import { Divider } from 'primeng/divider';

type SignUpStep = 1 | 2 | 3;

@Component({
  selector: 'app-sign-up',
  imports: [
    ReactiveFormsModule,
    Button,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    SignUpAccountStep,
    SignUpTargetStep,
    SignUpConfirmStep,
    RouterLink,
    Divider,
  ],
  providers: [SignUpFormService],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  private readonly signUpFormService = inject(SignUpFormService);

  protected readonly form = this.signUpFormService.createForm();

  protected readonly currentStep = signal<SignUpStep>(1);

  protected readonly canGoNext = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return this.form.controls.account.valid;

      case 2:
        return this.form.controls.target.valid;

      case 3:
        return this.form.valid;
    }
  });

  protected next(): void {
    const currentGroup = this.getCurrentStepGroup();

    if (currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      return;
    }

    if (this.currentStep() < 3) {
      this.currentStep.update((step) => (step + 1) as SignUpStep);
    }
  }

  protected previous(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => (step - 1) as SignUpStep);
    }
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const payload = this.signUpFormService.toPayload(this.form);

    console.log('Sign up payload:', payload);
  }

  private getCurrentStepGroup() {
    switch (this.currentStep()) {
      case 1:
        return this.form.controls.account;

      case 2:
        return this.form.controls.target;

      case 3:
        return this.form.controls.consent;
    }
  }
}
