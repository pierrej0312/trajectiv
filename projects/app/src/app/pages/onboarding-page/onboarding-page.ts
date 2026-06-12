import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  OnboardingControllerService,
  ProfileControllerService,
  UpdateMeProfileRequestApiDto,
} from '@shared-api-client';
import { Router } from '@angular/router';
import { AppContextStore } from '@core';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CareerGoal = UpdateMeProfileRequestApiDto.CareerGoalEnum;
type ExperienceLevel = UpdateMeProfileRequestApiDto.ExperienceLevelEnum;

@Component({
  selector: 'app-onboarding.page',
  imports: [],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.css',
})
export class OnboardingPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly profileApi = inject(ProfileControllerService);
  private readonly onboardingApi = inject(OnboardingControllerService);

  readonly appContext = inject(AppContextStore);

  readonly careerGoal = signal<CareerGoal | null>(null);
  readonly targetRole = signal('');
  readonly experienceLevel = signal<ExperienceLevel | null>(null);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly careerGoalOptions = [
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
    {
      label: 'Améliorer mon CV',
      description: 'Créer un CV qui met mieux en valeur mon profil.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.ImproveResume,
    },
    {
      label: 'Suivre mes opportunités',
      description: 'Suivre les offres qui m’intéressent.',
      value: UpdateMeProfileRequestApiDto.CareerGoalEnum.TrackOpportunities,
    },
  ] satisfies Array<{
    label: string;
    description: string;
    value: CareerGoal;
  }>;

  readonly experienceLevelOptions = [
    {
      label: 'Étudiant / Stagiaire',
      description: 'Je suis en formation initiale ou en stage.',
      value: UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Student,
    },
    {
      label: 'Junior',
      description: 'J’ai peu d’expérience professionnelle.',
      value: UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Junior,
    },
    {
      label: 'Medior',
      description: 'J’ai une expérience solide.',
      value: UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Medior,
    },
    {
      label: 'Senior',
      description: 'J’ai beaucoup d’expérience.',
      value: UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Senior,
    },
    {
      label: 'Reconversion',
      description: 'Je change de voie professionnelle.',
      value: UpdateMeProfileRequestApiDto.ExperienceLevelEnum.CareerChange,
    },
  ] satisfies Array<{
    label: string;
    description: string;
    value: ExperienceLevel;
  }>;

  readonly canSubmit = computed(() => {
    return (
      this.careerGoal() !== null &&
      this.targetRole().trim().length >= 2 &&
      this.experienceLevel() !== null &&
      !this.isSubmitting()
    );
  });

  selectCareerGoal(value: CareerGoal): void {
    this.careerGoal.set(value);
  }

  updateTargetRole(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.targetRole.set(input.value);
  }

  selectExperienceLevel(value: ExperienceLevel): void {
    this.experienceLevel.set(value);
  }

  submit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const payload: UpdateMeProfileRequestApiDto = {
      careerGoal: this.careerGoal() ?? undefined,
      targetRole: this.targetRole().trim(),
      experienceLevel: this.experienceLevel() ?? undefined,
      preferredLanguage: 'fr',
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.profileApi
      .updateProfile(payload, 'body', false, { transferCache: false })
      .pipe(
        switchMap(() => this.onboardingApi.completeOnboarding()),
        tap(() => {
          this.appContext.reloadMe();
          void this.router.navigateByUrl('/app/dashboard');
        }),
        catchError(() => {
          this.errorMessage.set(
            'Impossible de finaliser ton onboarding pour le moment. Réessaie dans quelques instants.',
          );

          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
