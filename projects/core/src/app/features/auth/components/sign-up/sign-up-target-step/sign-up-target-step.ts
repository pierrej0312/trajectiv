import { Component, input } from '@angular/core';
import { SignUpTargetForm } from '@features/auth/models/sign-up-form.model';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up-target-step',
  imports: [ReactiveFormsModule, InputText, Select],
  templateUrl: './sign-up-target-step.html',
  styleUrl: './sign-up-target-step.css',
})
export class SignUpTargetStep {
  readonly form = input.required<SignUpTargetForm>();

  readonly levels = [
    { label: 'Junior', value: 'junior' },
    { label: 'Medior', value: 'medior' },
    { label: 'Senior', value: 'senior' },
    { label: 'Reconversion / stage', value: 'internship' },
  ];

  readonly contractTypes = [
    { label: 'Stage', value: 'internship' },
    { label: 'CDI', value: 'permanent' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Alternance', value: 'apprenticeship' },
  ];

  readonly workModes = [
    { label: 'Sur site', value: 'onsite' },
    { label: 'Hybride', value: 'hybrid' },
    { label: 'Remote', value: 'remote' },
  ];
}
