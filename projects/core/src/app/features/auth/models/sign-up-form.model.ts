import { FormControl, FormGroup } from '@angular/forms';

export type SignUpLevel = 'internship' | 'junior' | 'medior' | 'senior';

export type SignUpContractType = 'internship' | 'permanent' | 'freelance' | 'apprenticeship';

export type SignUpWorkMode = 'onsite' | 'hybrid' | 'remote';

export type SignUpAccountForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

export type SignUpTargetForm = FormGroup<{
  targetRole: FormControl<string>;
  level: FormControl<SignUpLevel | null>;
  location: FormControl<string>;
  contractType: FormControl<SignUpContractType | null>;
  workMode: FormControl<SignUpWorkMode | null>;
}>;

export type SignUpConsentForm = FormGroup<{
  acceptTerms: FormControl<boolean>;
  acceptProductEmails: FormControl<boolean>;
}>;

export type SignUpForm = FormGroup<{
  account: SignUpAccountForm;
  target: SignUpTargetForm;
  consent: SignUpConsentForm;
}>;

export type SignUpPayload = {
  readonly account: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
  };
  readonly target: {
    readonly targetRole: string;
    readonly level: SignUpLevel;
    readonly location: string;
    readonly contractType: SignUpContractType;
    readonly workMode: SignUpWorkMode;
  };
  readonly consent: {
    readonly acceptTerms: boolean;
    readonly acceptProductEmails: boolean;
  };
};
