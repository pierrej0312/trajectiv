import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  SignUpAccountForm,
  SignUpConsentForm,
  SignUpContractType,
  SignUpForm,
  SignUpLevel,
  SignUpPayload,
  SignUpTargetForm,
  SignUpWorkMode,
} from '../models/sign-up-form.model';
import { passwordsMatchValidator } from '../validators/passwords-match.validator';

@Injectable()
export class SignUpFormService {
  createForm(): SignUpForm {
    return new FormGroup({
      account: this.createAccountForm(),
      target: this.createTargetForm(),
      consent: this.createConsentForm(),
    });
  }

  toPayload(form: SignUpForm): SignUpPayload {
    const value = form.getRawValue();

    return {
      account: {
        firstName: value.account.firstName.trim(),
        lastName: value.account.lastName.trim(),
        email: value.account.email.trim().toLowerCase(),
        password: value.account.password,
      },
      target: {
        targetRole: value.target.targetRole.trim(),
        level: value.target.level!,
        location: value.target.location.trim(),
        contractType: value.target.contractType!,
        workMode: value.target.workMode!,
      },
      consent: {
        acceptTerms: value.consent.acceptTerms,
        acceptProductEmails: value.consent.acceptProductEmails,
      },
    };
  }

  private createAccountForm(): SignUpAccountForm {
    return new FormGroup(
      {
        firstName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(2)],
        }),
        lastName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(2)],
        }),
        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email],
        }),
        password: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(8)],
        }),
        confirmPassword: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      },
      {
        validators: [passwordsMatchValidator()],
      },
    );
  }

  private createTargetForm(): SignUpTargetForm {
    return new FormGroup({
      targetRole: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      level: new FormControl<SignUpLevel | null>(null, {
        validators: [Validators.required],
      }),
      location: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      contractType: new FormControl<SignUpContractType | null>(null, {
        validators: [Validators.required],
      }),
      workMode: new FormControl<SignUpWorkMode | null>(null, {
        validators: [Validators.required],
      }),
    });
  }

  private createConsentForm(): SignUpConsentForm {
    return new FormGroup({
      acceptTerms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
      acceptProductEmails: new FormControl(false, {
        nonNullable: true,
      }),
    });
  }
}
