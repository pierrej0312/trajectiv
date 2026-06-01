import { Component, input } from '@angular/core';
import { SignUpAccountForm } from '@features/auth/models/sign-up-form.model';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up-account-step',
  imports: [ReactiveFormsModule, InputText, Password],
  templateUrl: './sign-up-account-step.html',
  styleUrl: './sign-up-account-step.css',
})
export class SignUpAccountStep {
  readonly form = input.required<SignUpAccountForm>();
}
