import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { MeProfileApiDto, UpdateMeProfileRequestApiDto } from '@shared-api-client';
import { SelectableOptionCard } from '@shared/components/selectable-option-card/selectable-option-card';
import { Panel } from 'primeng/panel';

type GoalOption = {
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly value: MeProfileApiDto.CareerGoalEnum;
};

@Component({
  selector: 'app-goal-step',
  imports: [SelectableOptionCard, Panel],
  templateUrl: './goal-step.html',
  styleUrl: './goal-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalStep {
  readonly onboarding = inject(OnboardingStore);

  readonly options: readonly GoalOption[] = [
    {
      label: 'Trouver un emploi',
      description: 'Trouver un CDI qui correspond à mes compétences.',
      icon: 'pi pi-briefcase',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.FindJob,
    },
    {
      label: 'Trouver un stage',
      description: 'Trouver un stage pour apprendre et me développer.',
      icon: 'pi pi-graduation-cap',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.FindInternship,
    },
    {
      label: 'Changer de métier',
      description: 'Me reconvertir et trouver un nouveau chemin professionnel.',
      icon: 'pi pi-arrow-right-arrow-left',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.ChangeCareer,
    },
    {
      label: 'Préparer un entretien',
      description: 'Être prêt pour mes futurs entretiens.',
      icon: 'pi pi-microphone',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.PrepareInterview,
    },
    {
      label: 'Améliorer mon CV',
      description: 'Créer un CV qui met mieux en valeur mon profil.',
      icon: 'pi pi-file',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.ImproveResume,
    },
    {
      label: 'Suivre mes opportunités',
      description: 'Suivre les offres qui m’intéressent.',
      icon: 'pi pi-bullseye',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.TrackOpportunities,
    },
  ];
}
