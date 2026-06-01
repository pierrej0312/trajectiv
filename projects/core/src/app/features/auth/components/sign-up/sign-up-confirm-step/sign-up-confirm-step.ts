import { Component, input } from '@angular/core';
import {
  SignUpAccountForm,
  SignUpConsentForm,
  SignUpForm,
  SignUpTargetForm,
} from '@features/auth/models/sign-up-form.model';
import { Checkbox } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up-confirm-step',
  imports: [ReactiveFormsModule, Checkbox],
  templateUrl: './sign-up-confirm-step.html',
  styleUrl: './sign-up-confirm-step.css',
})
export class SignUpConfirmStep {
  readonly form = input.required<SignUpForm>();
  readonly accountForm = input.required<SignUpAccountForm>();
  readonly targetForm = input.required<SignUpTargetForm>();
  readonly consentForm = input.required<SignUpConsentForm>();
}
