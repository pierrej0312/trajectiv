import { Component, inject } from '@angular/core';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { MeProfileApiDto, UpdateMeProfileRequestApiDto } from '@shared-api-client';

@Component({
  selector: 'app-goal-step',
  imports: [],
  templateUrl: './goal-step.html',
  styleUrl: './goal-step.css',
})
export class GoalStep {
  readonly onboarding = inject(OnboardingStore);

  readonly options = [
    {
      label: 'Trouver un emploi',
      description: 'Trouver un CDI qui correspond à mes compétences.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.FindJob,
    },
    {
      label: 'Trouver un stage',
      description: 'Trouver un stage pour apprendre et me développer.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.FindInternship,
    },
    {
      label: 'Changer de métier',
      description: 'Me reconvertir et trouver un nouveau chemin professionnel.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.ChangeCareer,
    },
    {
      label: 'Préparer un entretien',
      description: 'Être prêt pour mes futurs entretiens.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.PrepareInterview,
    },
  ] satisfies Array<{
    label: string;
    description: string;
    value: MeProfileApiDto.CareerGoalEnum;
  }>;
}
