import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignInForm, signInSchema } from '@features/auth/models/sign-in.schema';
import { form, FormField, submit, validateStandardSchema } from '@angular/forms/signals';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormErrors } from '@core/src/app/components/form-errors/form-errors';

import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormField,
    Button,
    InputText,
    FormErrors,
    InputGroup,
    InputGroupAddon,
    Checkbox,
    RouterLink,
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly _router = inject(Router);

  protected readonly showPassword = signal(false);

  private formState = signal<SignInForm>({
    email: '',
    password: '',
    rememberMe: false,
  });
  protected form = form(this.formState, (schema) => {
    validateStandardSchema(schema, signInSchema);
  });

  async onSubmit($event: SubmitEvent) {
    $event.preventDefault();
    await submit(this.form, {
      action: async (f) => {
        console.log('Form submitted with values:', f().value());
        const user = { username: f.email().value() };

        console.log('User:', user);
      },
      onInvalid: (root) => {
        console.log('Form is invalid:', root().errors());
      },
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
