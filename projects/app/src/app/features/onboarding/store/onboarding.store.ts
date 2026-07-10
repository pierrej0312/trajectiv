import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import {
  JobRoleControllerService,
  JobRoleSuggestionApiDto,
  OnboardingControllerService,
  ProfileControllerService,
  UpdateMeProfileRequestApiDto,
} from '@shared-api-client';
import { AppContextStore } from '@core';
import { CompanionAnimationCommand, CompanionAnimationName } from '@shared/companion/models/companion-animation.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AvatarCustomizationStore } from '@shared/companion/stores/avatar-customization.store';

type CareerGoal = UpdateMeProfileRequestApiDto.CareerGoalEnum;
type ExperienceLevel = UpdateMeProfileRequestApiDto.ExperienceLevelEnum;

type TargetRoleSource = UpdateMeProfileRequestApiDto.TargetRoleSourceEnum;

type JobRoleFamily = JobRoleSuggestionApiDto.FamilyEnum;

type TargetRoleSelection =
  | {
      readonly source: 'CATALOG';
      readonly id: string;
      readonly label: string;
    }
  | {
      readonly source: 'CUSTOM';
      readonly id: null;
      readonly label: string;
    };

type TargetRoleSearchCriteria = {
  readonly query: string;
  readonly family: JobRoleFamily | null;
};

type OnboardingMissingField =
  | 'careerGoal'
  | 'targetRole'
  | 'targetRoleLabel'
  | 'targetRoleId'
  | 'targetRoleSource'
  | 'experienceLevel';

type OnboardingMissingFieldVm = {
  readonly field: OnboardingMissingField | string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
};

const ONBOARDING_MISSING_FIELD_BY_FIELD: Record<string, OnboardingMissingFieldVm> = {
  careerGoal: {
    field: 'careerGoal',
    label: 'Objectif principal',
    description: 'Choisis la raison principale pour laquelle tu utilises Trajectiv.',
    icon: 'pi pi-compass',
    route: '/app/onboarding/goal',
  },
  targetRole: {
    field: 'targetRole',
    label: 'Rôle cible',
    description: 'Indique le métier ou le rôle que tu souhaites viser.',
    icon: 'pi pi-briefcase',
    route: '/app/onboarding/target-role',
  },
  targetRoleLabel: {
    field: 'targetRoleLabel',
    label: 'Rôle cible',
    description: 'Indique le métier ou le rôle que tu souhaites viser.',
    icon: 'pi pi-briefcase',
    route: '/app/onboarding/target-role',
  },
  targetRoleId: {
    field: 'targetRoleId',
    label: 'Rôle cible',
    description: 'Sélectionne un rôle du catalogue ou garde un rôle personnalisé.',
    icon: 'pi pi-briefcase',
    route: '/app/onboarding/target-role',
  },
  targetRoleSource: {
    field: 'targetRoleSource',
    label: 'Rôle cible',
    description: 'Confirme ton rôle cible.',
    icon: 'pi pi-briefcase',
    route: '/app/onboarding/target-role',
  },
  experienceLevel: {
    field: 'experienceLevel',
    label: 'Niveau d’expérience',
    description: 'Sélectionne ton niveau pour adapter l’accompagnement.',
    icon: 'pi pi-chart-line',
    route: '/app/onboarding/experience-level',
  },
};

export type OnboardingStepKey =
  | 'welcome'
  | 'avatar'
  | 'goal'
  | 'target-role'
  | 'experience-level'
  | 'review';

export type OnboardingStep = {
  readonly key: OnboardingStepKey;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly optional?: boolean;
};

export type OnboardingStepVm = OnboardingStep & {
  readonly index: number;
  readonly active: boolean;
  readonly completed: boolean;
  readonly disabled: boolean;
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    key: 'welcome',
    label: 'Bienvenue',
    description: 'Découvrir Trajectiv',
    icon: 'pi pi-sparkles',
    route: '/app/onboarding/welcome',
  },
  {
    key: 'avatar',
    label: 'Avatar',
    description: 'Personnaliser ton profil',
    icon: 'pi pi-user',
    route: '/app/onboarding/avatar',
    optional: true,
  },
  {
    key: 'goal',
    label: 'Objectif',
    description: 'Définir ton objectif principal',
    icon: 'pi pi-compass',
    route: '/app/onboarding/goal',
  },
  {
    key: 'target-role',
    label: 'Rôle cible',
    description: 'Indiquer le métier visé',
    icon: 'pi pi-briefcase',
    route: '/app/onboarding/target-role',
  },
  {
    key: 'experience-level',
    label: 'Niveau',
    description: 'Adapter l’accompagnement',
    icon: 'pi pi-chart-line',
    route: '/app/onboarding/experience-level',
  },
  {
    key: 'review',
    label: 'Résumé',
    description: 'Valider ton espace',
    icon: 'pi pi-check-circle',
    route: '/app/onboarding/review',
  },
];

const CAREER_GOAL_ANIMATION_BY_GOAL: Record<
  UpdateMeProfileRequestApiDto.CareerGoalEnum,
  CompanionAnimationName
> = {
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.FindJob]: 'excited',
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.FindInternship]: 'lookAround',
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.ChangeCareer]: 'surprised',
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.PrepareInterview]: 'talkingPhone',
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.ImproveResume]: 'searchPocket',
  [UpdateMeProfileRequestApiDto.CareerGoalEnum.TrackOpportunities]: 'thinking',
};

const EXPERIENCE_LEVEL_ORDER: readonly ExperienceLevel[] = [
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Student,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Junior,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Medior,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Senior,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.CareerChange,
];

const EXPERIENCE_LEVEL_SCALE_ORDER: readonly ExperienceLevel[] = [
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Student,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Junior,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Medior,
  UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Senior,
];

@Injectable({
  providedIn: 'root',
})
export class OnboardingStore {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileApi = inject(ProfileControllerService);
  private readonly onboardingApi = inject(OnboardingControllerService);
  private readonly appContext = inject(AppContextStore);
  private readonly jobRoleApi = inject(JobRoleControllerService);
  private readonly companionStore = inject(AvatarCustomizationStore);

  readonly currentUrl = signal(this.normalizeUrl(this.router.url));

  readonly displayName = signal('');
  readonly careerGoal = signal<CareerGoal | null>(null);

  readonly hasChosenCompanion = signal(false);

  readonly onboardingMissingFields = signal<readonly string[]>([]);

  readonly onboardingMissingFieldItems = computed<readonly OnboardingMissingFieldVm[]>(() => {
    const seenRoutes = new Set<string>();

    return this.onboardingMissingFields()
      .map(
        (field) =>
          ONBOARDING_MISSING_FIELD_BY_FIELD[field] ??
          this.createUnknownOnboardingMissingField(field),
      )
      .filter((item) => {
        if (seenRoutes.has(item.route)) {
          return false;
        }

        seenRoutes.add(item.route);
        return true;
      });
  });

  readonly hasOnboardingMissingFields = computed(() => {
    return this.onboardingMissingFieldItems().length > 0;
  });

  readonly careerGoalLabels: Record<CareerGoal, string> = {
    FIND_JOB: 'Trouver un emploi',
    FIND_INTERNSHIP: 'Trouver un stage',
    CHANGE_CAREER: 'Changer de métier',
    PREPARE_INTERVIEW: 'Préparer un entretien',
    IMPROVE_RESUME: 'Améliorer mon CV',
    TRACK_OPPORTUNITIES: 'Suivre mes opportunités',
  };

  readonly careerGoalDescriptions: Record<CareerGoal, string> = {
    FIND_JOB: 'Construire une trajectoire claire pour décrocher un emploi.',
    FIND_INTERNSHIP: 'Préparer un profil crédible pour obtenir un stage.',
    CHANGE_CAREER: 'Rendre ta transition lisible, cohérente et rassurante.',
    PREPARE_INTERVIEW: 'Transformer ta préparation en réponses solides.',
    IMPROVE_RESUME: 'Améliorer ton CV pour mieux valoriser ton parcours.',
    TRACK_OPPORTUNITIES: 'Suivre tes candidatures et garder une vision claire.',
  };

  readonly targetRoleQuery = signal('');
  readonly targetRoleFamily = signal<JobRoleFamily | null>(null);
  readonly targetRoleSelection = signal<TargetRoleSelection | null>(null);
  readonly targetRoleSuggestions = signal<readonly JobRoleSuggestionApiDto[]>([]);
  readonly isSearchingTargetRoles = signal(false);
  readonly targetRoleSearchMessage = signal<string | null>(null);

  private readonly hasHydratedFromMe = signal(false);

  readonly targetRoleFamilies = signal<readonly JobRoleFamily[]>([
    'SOFTWARE_ENGINEERING',
    'PRODUCT_DESIGN',
    'DATA',
    'DEVOPS_CLOUD',
    'PROJECT_MANAGEMENT',
    'PRODUCT_MANAGEMENT',
    'QUALITY_ASSURANCE',
    'BUSINESS_ANALYSIS',
    'OTHER',
  ]);

  readonly targetRoleFamilyLabels: Record<JobRoleFamily, string> = {
    SOFTWARE_ENGINEERING: 'Développement logiciel',
    PRODUCT_DESIGN: 'Product design',
    DATA: 'Data',
    DEVOPS_CLOUD: 'DevOps & Cloud',
    PROJECT_MANAGEMENT: 'Gestion de projet',
    PRODUCT_MANAGEMENT: 'Product management',
    QUALITY_ASSURANCE: 'QA / Test',
    BUSINESS_ANALYSIS: 'Business analysis',
    OTHER: 'Autre',
  };

  readonly experienceLevel = signal<ExperienceLevel>(
    UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Junior,
  );

  readonly experienceLevels = signal<readonly ExperienceLevel[]>(EXPERIENCE_LEVEL_ORDER);

  readonly selectedExperienceLevelIndex = computed(() => {
    const level = this.experienceLevel();

    if (!level) {
      return -1;
    }

    return EXPERIENCE_LEVEL_ORDER.indexOf(level);
  });

  readonly selectedScaleExperienceLevelIndex = computed(() => {
    const level = this.experienceLevel();

    if (!level) {
      return -1;
    }

    return EXPERIENCE_LEVEL_SCALE_ORDER.indexOf(level);
  });

  readonly showCompanionStage = computed(() => {
    const key = this.activeStepKey();

    if (key === 'welcome' || key === 'review') {
      return false;
    }

    if (key === 'avatar') {
      return true;
    }

    return this.hasChosenCompanion();
  });

  readonly experienceProgress = computed(() => {
    const index = this.selectedScaleExperienceLevelIndex();

    if (index < 0) {
      return this.experienceLevel() ===
        UpdateMeProfileRequestApiDto.ExperienceLevelEnum.CareerChange
        ? 50
        : 0;
    }

    return Math.round(((index + 1) / EXPERIENCE_LEVEL_SCALE_ORDER.length) * 100);
  });

  readonly canDecreaseExperienceLevel = computed(() => {
    return this.selectedExperienceLevelIndex() > 0;
  });

  readonly canIncreaseExperienceLevel = computed(() => {
    const index = this.selectedExperienceLevelIndex();

    return index >= 0 && index < EXPERIENCE_LEVEL_ORDER.length - 1;
  });

  readonly experienceLevelLabels: Record<ExperienceLevel, string> = {
    STUDENT: 'Étudiant',
    JUNIOR: 'Junior',
    MEDIOR: 'Medior',
    SENIOR: 'Senior',
    CAREER_CHANGE: 'Reconversion',
  };

  readonly experienceLevelDescriptions: Record<ExperienceLevel, string> = {
    STUDENT: 'Je suis encore en formation ou au tout début de mon parcours.',
    JUNIOR: 'Je sais pratiquer, mais j’ai besoin de structurer mes réponses.',
    MEDIOR: 'Je suis autonome sur des projets réels et je veux mieux valoriser mon expérience.',
    SENIOR: 'Je veux affiner mon positionnement, mon discours et mes décisions techniques.',
    CAREER_CHANGE: 'Je viens d’un autre métier et je veux rendre ma transition crédible.',
  };

  readonly experienceLevelHints: Record<ExperienceLevel, string> = {
    STUDENT: 'Trajectiv t’aidera à transformer tes apprentissages en discours clair et rassurant.',
    JUNIOR: 'Trajectiv t’aidera à transformer ta pratique en réponses solides d’entretien.',
    MEDIOR: 'Trajectiv mettra davantage l’accent sur autonomie, impact projet et arbitrages.',
    SENIOR: 'Trajectiv privilégiera les questions de profondeur, leadership et architecture.',
    CAREER_CHANGE:
      'Trajectiv t’aidera à relier ton ancien parcours à ton nouveau rôle cible sans te dévaloriser.',
  };

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly idleDanceDelayMs = 15 * 60 * 1000;
  private readonly idleDanceCooldownMs = 17_000;

  private idleDanceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private idleDanceCooldownTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly animationCommandId = signal(0);

  readonly manualCompanionCommand = signal<CompanionAnimationCommand | null>(null);

  readonly suggestedDisplayName = computed(() => {
    const me = this.appContext.me();

    if (!me) {
      return '';
    }

    if (me.displayName?.trim()) {
      return me.displayName.trim();
    }

    const fullName = [me.firstName, me.lastName]
      .filter((part) => part?.trim())
      .join(' ')
      .trim();

    if (fullName) {
      return fullName;
    }

    return me.email?.split('@')[0] ?? '';
  });

  readonly activeStepKey = computed<OnboardingStepKey>(() => {
    const activeStep = ONBOARDING_STEPS.find((step) =>
      this.isRouteMatch(this.currentUrl(), step.route),
    );

    return activeStep?.key ?? 'welcome';
  });

  readonly activeStepIndex = computed(() => {
    return ONBOARDING_STEPS.findIndex((step) => step.key === this.activeStepKey());
  });

  readonly isLastStep = computed(() => {
    return this.activeStepKey() === 'review';
  });

  readonly targetRoleLabel = computed(() => {
    return this.targetRoleSelection()?.label ?? this.targetRoleQuery().trim();
  });

  readonly hasTargetRole = computed(() => {
    return this.targetRoleLabel().length >= 2;
  });

  readonly hasCatalogTargetRole = computed(() => {
    return this.targetRoleSelection()?.source === 'CATALOG';
  });

  readonly selectedTargetRoleId = computed(() => {
    const selection = this.targetRoleSelection();

    return selection?.source === 'CATALOG' ? selection.id : null;
  });

  readonly canComplete = computed(() => {
    return (
      this.careerGoal() !== null &&
      this.hasTargetRole() &&
      this.experienceLevel() !== null &&
      !this.isSubmitting()
    );
  });

  readonly steps = computed<OnboardingStepVm[]>(() => {
    const activeIndex = this.activeStepIndex();

    return ONBOARDING_STEPS.map((step, index) => ({
      ...step,
      index,
      active: step.key === this.activeStepKey(),
      completed: this.isStepCompleted(step.key),
      disabled: index > activeIndex + 1 && !this.canReachStep(index),
    }));
  });

  readonly progress = computed(() => {
    const completedCount = this.steps().filter((step) => step.completed).length;

    return Math.round((completedCount / ONBOARDING_STEPS.length) * 100);
  });

  readonly canGoPrevious = computed(() => this.activeStepIndex() > 0);

  readonly shouldPatchProfileBeforeNext = computed(() => {
    const key = this.activeStepKey();

    return key === 'goal' || key === 'target-role' || key === 'experience-level';
  });

  readonly canGoNext = computed(() => {
    const key = this.activeStepKey();

    if (this.isSubmitting()) {
      return false;
    }

    if (key === 'welcome' || key === 'avatar') {
      return true;
    }

    if (key === 'goal') {
      return this.careerGoal() !== null;
    }

    if (key === 'target-role') {
      return this.hasTargetRole();
    }

    if (key === 'experience-level') {
      return this.experienceLevel() !== null;
    }

    if (key === 'review') {
      return this.canComplete();
    }

    return true;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(this.normalizeUrl(event.urlAfterRedirects));
      });

    effect(() => {
      const me = this.appContext.me();

      if (!me || this.hasHydratedFromMe()) {
        return;
      }

      const profile = me.profile;

      if (!profile) {
        return;
      }

      untracked(() => {
        this.displayName.set(me.displayName ?? this.suggestedDisplayName());

        if (profile.careerGoal) {
          this.careerGoal.set(profile.careerGoal);
        }

        if (profile.targetRoleLabel) {
          this.targetRoleQuery.set(profile.targetRoleLabel);

          if (profile.targetRoleSource === 'CATALOG' && profile.targetRoleId) {
            this.targetRoleSelection.set({
              source: 'CATALOG',
              id: profile.targetRoleId,
              label: profile.targetRoleLabel,
            });
          } else {
            this.targetRoleSelection.set({
              source: 'CUSTOM',
              id: null,
              label: profile.targetRoleLabel,
            });
          }
        }

        if (profile.experienceLevel) {
          this.experienceLevel.set(profile.experienceLevel);
        }

        this.hasHydratedFromMe.set(true);
      });
    });

    effect((onCleanup) => {
      const step = this.activeStepKey();

      untracked(() => {
        this.clearIdleDanceTimer();
        this.manualCompanionCommand.set(null);
      });

      if (step === 'welcome') {
        return;
      }

      if (step === 'review') {
        untracked(() => {
          this.playCompanionOnce('victory', 'idle');
        });

        onCleanup(() => {
          untracked(() => {
            this.clearIdleDanceTimer();
          });
        });

        return;
      }

      untracked(() => {
        this.scheduleIdleDance();
      });

      onCleanup(() => {
        untracked(() => {
          this.clearIdleDanceTimer();
        });
      });
    });
    effect(() => {
      const suggestedDisplayName = this.suggestedDisplayName();

      if (this.displayName().trim() || !suggestedDisplayName) {
        return;
      }

      this.displayName.set(suggestedDisplayName);
    });
  }

  setCareerGoal(value: CareerGoal): void {
    if (this.careerGoal() === value) {
      return;
    }

    this.careerGoal.set(value);
    this.clearOnboardingMissingFields('careerGoal');

    const animation = CAREER_GOAL_ANIMATION_BY_GOAL[value];

    this.playCompanionOnce(animation, 'idle');
  }

  setTargetRoleQuery(value: string): void {
    this.targetRoleQuery.set(value);
    this.searchCurrentTargetRoles();
  }

  setTargetRoleFamily(value: JobRoleFamily | null): void {
    this.targetRoleFamily.set(value);
    this.searchCurrentTargetRoles();
  }

  confirmCompanion(): void {
    this.hasChosenCompanion.set(true);
  }

  skipCompanion(): void {
    this.hasChosenCompanion.set(false);
  }

  clearTargetRole(): void {
    this.targetRoleQuery.set('');
    this.targetRoleSelection.set(null);
    this.targetRoleSuggestions.set([]);
    this.targetRoleSearchMessage.set(null);
    this.isSearchingTargetRoles.set(false);
  }

  clearTargetRoleSelection(): void {
    this.targetRoleSelection.set(null);

    if (this.targetRoleQuery().trim().length >= 2) {
      this.searchCurrentTargetRoles();
    }
  }

  selectTargetRoleSuggestion(suggestion: JobRoleSuggestionApiDto): void {
    if (!suggestion.id || !suggestion.label) {
      return;
    }

    this.targetRoleSelection.set({
      source: 'CATALOG',
      id: suggestion.id,
      label: suggestion.label,
    });

    this.targetRoleQuery.set(suggestion.label);
    this.clearTargetRoleMissingFields();
    this.targetRoleSearchMessage.set(null);
  }

  useCustomTargetRole(): void {
    const label = this.targetRoleQuery().trim();

    if (label.length < 2) {
      return;
    }

    this.targetRoleSelection.set({
      source: 'CUSTOM',
      id: null,
      label,
    });

    this.targetRoleSuggestions.set([]);
    this.clearTargetRoleMissingFields();
    this.targetRoleSearchMessage.set(null);
  }

  setExperienceLevel(value: ExperienceLevel): void {
    const previousIndex = this.selectedExperienceLevelIndex();
    const nextIndex = EXPERIENCE_LEVEL_ORDER.indexOf(value);

    if (nextIndex === -1 || this.experienceLevel() === value) {
      return;
    }

    this.experienceLevel.set(value);
    this.clearOnboardingMissingFields('experienceLevel');

    if (previousIndex === -1 || nextIndex > previousIndex) {
      this.playCompanionOnce('levelUp', 'idle');
      return;
    }

    this.playCompanionOnce('levelDown', 'idle');
  }

  increaseExperienceLevel(): void {
    const currentIndex = this.selectedExperienceLevelIndex();

    if (currentIndex === -1) {
      this.setExperienceLevel(UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Junior);
      return;
    }

    const nextLevel = EXPERIENCE_LEVEL_ORDER[currentIndex + 1];

    if (!nextLevel) {
      return;
    }

    this.setExperienceLevel(nextLevel);
  }

  decreaseExperienceLevel(): void {
    const currentIndex = this.selectedExperienceLevelIndex();

    if (currentIndex === -1) {
      this.setExperienceLevel(UpdateMeProfileRequestApiDto.ExperienceLevelEnum.Student);
      return;
    }

    const previousLevel = EXPERIENCE_LEVEL_ORDER[currentIndex - 1];

    if (!previousLevel) {
      return;
    }

    this.setExperienceLevel(previousLevel);
  }

  setDisplayName(value: string): void {
    this.displayName.set(value);
  }

  goPrevious(): void {
    const previousStep = ONBOARDING_STEPS[this.activeStepIndex() - 1];

    if (!previousStep) {
      return;
    }

    this.setStepDirection('previous');
    void this.router.navigateByUrl(previousStep.route);
    document.querySelector('.app-layout')!.scrollTo({ top: 0 });
  }

  goNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    if (this.shouldPatchProfileBeforeNext()) {
      this.patchProfileAndGoNext();
      return;
    }

    this.navigateToNextStep();
  }

  private navigateToNextStep(): void {
    const nextStep = ONBOARDING_STEPS[this.activeStepIndex() + 1];

    if (!nextStep) {
      return;
    }

    this.setStepDirection('next');
    void this.router.navigateByUrl(nextStep.route);

    document.querySelector('.app-layout')?.scrollTo({ top: 0 });
  }

  private patchProfileAndGoNext(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.profileApi
      .updateProfile(this.createProfilePayloadForCurrentStep(), 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      })
      .pipe(
        tap((response) => {
          if (response.onboarding?.missingFields?.length) {
            this.errorMessage.set(
              'Certaines informations sont encore manquantes. Vérifie les champs indiqués avant de continuer.',
            );

            return;
          }

          this.navigateToNextStep();
        }),
        catchError(() => {
          this.errorMessage.set(
            'Impossible de sauvegarder tes informations pour le moment. Réessaie dans quelques instants.',
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

  goToRoute(route: string): void {
    this.setDirectionFromTargetRoute(route);
    void this.router.navigateByUrl(route);
    document.querySelector('.app-layout')?.scrollTo({ top: 0 });
  }

  goToStep(step: OnboardingStepVm): void {
    if (step.disabled) {
      return;
    }

    this.setDirectionFromTargetRoute(step.route);
    void this.router.navigateByUrl(step.route);
  }

  private setDirectionFromTargetRoute(targetRoute: string): void {
    const currentIndex = this.activeStepIndex();
    const targetIndex = ONBOARDING_STEPS.findIndex((step) => step.route === targetRoute);

    if (targetIndex === -1 || targetIndex === currentIndex) {
      return;
    }

    this.setStepDirection(targetIndex > currentIndex ? 'next' : 'previous');
  }

  private createProfilePayload(): UpdateMeProfileRequestApiDto {
    const selection = this.targetRoleSelection();
    const fallbackLabel = this.targetRoleQuery().trim();

    return {
      displayName: this.displayName().trim() || undefined,
      careerGoal: this.careerGoal() ?? undefined,
      targetRoleId: selection?.source === 'CATALOG' ? selection.id : undefined,
      targetRoleLabel: (selection?.label ?? fallbackLabel) || undefined,
      targetRoleSource: selection?.source ?? (fallbackLabel ? 'CUSTOM' : undefined),
      experienceLevel: this.experienceLevel() ?? undefined,
      preferredLanguage: 'fr',
    };
  }

  saveProfileDraftAndGoNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.profileApi
      .updateProfile(this.createProfilePayload(), 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      })
      .pipe(
        tap((response) => {
          const missingFields = response.onboarding?.missingFields ?? [];
          const blockingMissingFields = this.getBlockingMissingFieldsForCurrentStep(missingFields);

          if (blockingMissingFields.length > 0) {
            this.onboardingMissingFields.set(blockingMissingFields);
            this.errorMessage.set(
              'Certaines informations nécessaires à cette étape sont encore manquantes.',
            );

            return;
          }

          this.onboardingMissingFields.set([]);
          this.navigateToNextStep();
        }),
        catchError(() => {
          this.errorMessage.set(
            'Impossible de sauvegarder tes informations pour le moment. Réessaie dans quelques instants.',
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

  private searchCurrentTargetRoles(): void {
    this.searchTargetRoles({
      query: this.targetRoleQuery(),
      family: this.targetRoleFamily(),
    });
  }

  private isStepCompleted(key: OnboardingStepKey): boolean {
    if (key === 'welcome') {
      return true;
    }

    if (key === 'avatar') {
      return true;
    }

    if (key === 'goal') {
      return this.careerGoal() !== null;
    }

    if (key === 'target-role') {
      return this.hasTargetRole();
    }

    if (key === 'experience-level') {
      return this.experienceLevel() !== null;
    }

    if (key === 'review') {
      return this.careerGoal() !== null && this.hasTargetRole() && this.experienceLevel() !== null;
    }

    return false;
  }

  complete(): void {
    if (!this.canComplete()) {
      return;
    }

    this.onboardingMissingFields.set([]);

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.profileApi
      .updateProfile(this.createProfilePayload(), 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      })
      .pipe(
        switchMap((response) => {
          const missingFields = response.onboarding?.missingFields ?? [];

          if (missingFields.length > 0) {
            this.onboardingMissingFields.set(missingFields);
            this.errorMessage.set(
              'Certaines informations sont nécessaires pour finaliser ton onboarding.',
            );

            return EMPTY;
          }

          return this.onboardingApi.completeOnboarding();
        }),
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

  private createProfilePayloadForCurrentStep(): UpdateMeProfileRequestApiDto {
    const key = this.activeStepKey();

    if (key === 'goal') {
      return {
        displayName: this.displayName().trim() || undefined,
        careerGoal: this.careerGoal() ?? undefined,
        preferredLanguage: 'fr',
      };
    }

    if (key === 'target-role') {
      const selection = this.targetRoleSelection();
      const fallbackLabel = this.targetRoleQuery().trim();

      return {
        displayName: this.displayName().trim() || undefined,
        careerGoal: this.careerGoal() ?? undefined,
        targetRoleId: selection?.source === 'CATALOG' ? selection.id : undefined,
        targetRoleLabel: (selection?.label ?? fallbackLabel) || undefined,
        targetRoleSource: selection?.source ?? (fallbackLabel ? 'CUSTOM' : undefined),
        preferredLanguage: 'fr',
      };
    }

    return this.createProfilePayload();
  }

  private canReachStep(index: number): boolean {
    return ONBOARDING_STEPS.slice(0, index).every(
      (step) => step.optional || this.isStepCompleted(step.key),
    );
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0]?.split('#')[0] ?? url;
  }

  private isRouteMatch(currentUrl: string, route: string): boolean {
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }

  readonly showFooter = computed(() => {
    return this.activeStepKey() !== 'welcome';
  });

  readonly companionCommand = computed<CompanionAnimationCommand>(() => {
    const manualCommand = this.manualCompanionCommand();

    if (manualCommand) {
      return manualCommand;
    }

    return this.createAnimationCommand('idle', 'loop');
  });

  private createAnimationCommand(
    name: CompanionAnimationCommand['name'],
    mode: CompanionAnimationCommand['mode'],
    fallback?: CompanionAnimationCommand['fallback'],
  ): CompanionAnimationCommand {
    return {
      id: this.animationCommandId(),
      name,
      mode,
      fallback,
    };
  }

  readonly searchTargetRoles = rxMethod<TargetRoleSearchCriteria>(
    pipe(
      debounceTime(220),
      distinctUntilChanged((previous, current) => {
        return previous.query === current.query && previous.family === current.family;
      }),
      tap((criteria) => {
        const normalizedQuery = criteria.query.trim();

        if (normalizedQuery.length < 2) {
          this.targetRoleSuggestions.set([]);
          this.targetRoleSearchMessage.set(null);
          this.isSearchingTargetRoles.set(false);
          return;
        }

        this.isSearchingTargetRoles.set(true);
        this.targetRoleSearchMessage.set(null);
      }),
      switchMap((criteria) => {
        const normalizedQuery = criteria.query.trim();

        if (normalizedQuery.length < 2) {
          return EMPTY;
        }

        return this.jobRoleApi
          .searchJobRoles(normalizedQuery, criteria.family ?? undefined, 8, 'body', false, {
            httpHeaderAccept: 'application/json',
            transferCache: false,
          })
          .pipe(
            tap((suggestions) => {
              this.targetRoleSuggestions.set(suggestions);
              this.isSearchingTargetRoles.set(false);

              this.targetRoleSearchMessage.set(
                suggestions.length === 0
                  ? 'Aucun rôle exact trouvé dans cette catégorie. Tu peux changer de catégorie ou garder ce rôle personnalisé.'
                  : null,
              );
            }),
            catchError(() => {
              this.targetRoleSuggestions.set([]);
              this.isSearchingTargetRoles.set(false);
              this.targetRoleSearchMessage.set('Impossible de chercher les rôles pour le moment.');

              return EMPTY;
            }),
          );
      }),
    ),
  );

  private nextAnimationCommandId(): number {
    const nextId = this.animationCommandId() + 1;
    this.animationCommandId.set(nextId);

    return nextId;
  }

  goToOnboardingMissingField(item: OnboardingMissingFieldVm): void {
    this.goToRoute(item.route);
  }

  private createUnknownOnboardingMissingField(field: string): OnboardingMissingFieldVm {
    return {
      field,
      label: 'Information manquante',
      description: `Une information nécessaire à l’onboarding est manquante : ${field}.`,
      icon: 'pi pi-info-circle',
      route: '/app/onboarding/review',
    };
  }

  playCompanionOnce(
    name: CompanionAnimationCommand['name'],
    fallback: CompanionAnimationCommand['fallback'] = 'idle',
  ): void {
    this.clearIdleDanceTimer();

    const id = this.nextAnimationCommandId();

    this.manualCompanionCommand.set({
      id,
      name,
      mode: 'once',
      fallback,
    });
  }

  playCompanionLoop(name: CompanionAnimationCommand['name']): void {
    this.clearIdleDanceTimer();

    const id = this.nextAnimationCommandId();

    this.manualCompanionCommand.set({
      id,
      name,
      mode: 'loop',
    });
  }

  private scheduleIdleDance(): void {
    this.clearIdleDanceTimer();

    this.idleDanceTimeoutId = setTimeout(() => {
      this.playCompanionOnce('dancing', 'idle');

      this.idleDanceCooldownTimeoutId = setTimeout(() => {
        this.manualCompanionCommand.set(null);
        this.scheduleIdleDance();
      }, this.idleDanceCooldownMs);
    }, this.idleDanceDelayMs);
  }

  private clearIdleDanceTimer(): void {
    if (this.idleDanceTimeoutId !== null) {
      clearTimeout(this.idleDanceTimeoutId);
      this.idleDanceTimeoutId = null;
    }

    if (this.idleDanceCooldownTimeoutId !== null) {
      clearTimeout(this.idleDanceCooldownTimeoutId);
      this.idleDanceCooldownTimeoutId = null;
    }
  }

  private setStepDirection(direction: 'next' | 'previous'): void {
    document.documentElement.dataset['onboardingDirection'] = direction;
    console.log('ONBOARDING_DIRECTION', direction);
  }
  private clearOnboardingMissingFields(...fieldsToClear: readonly string[]): void {
    const fieldsToClearSet = new Set(fieldsToClear);

    this.onboardingMissingFields.set(
      this.onboardingMissingFields().filter((field) => !fieldsToClearSet.has(field)),
    );
  }

  private clearTargetRoleMissingFields(): void {
    this.clearOnboardingMissingFields(
      'targetRole',
      'targetRoleLabel',
      'targetRoleId',
      'targetRoleSource',
    );
  }

  private getBlockingMissingFieldsForCurrentStep(
    missingFields: readonly string[],
  ): readonly string[] {
    const key = this.activeStepKey();
    const normalizedFields = missingFields.map((field) =>
      this.normalizeOnboardingMissingField(field),
    );

    if (key === 'goal') {
      return normalizedFields.filter((field) => field === 'careerGoal');
    }

    if (key === 'target-role') {
      return normalizedFields.filter(
        (field) =>
          field === 'careerGoal' ||
          field === 'targetRole' ||
          field === 'targetRoleLabel' ||
          field === 'targetRoleId' ||
          field === 'targetRoleSource',
      );
    }

    if (key === 'experience-level') {
      return normalizedFields.filter(
        (field) =>
          field === 'careerGoal' ||
          field === 'targetRole' ||
          field === 'targetRoleLabel' ||
          field === 'targetRoleId' ||
          field === 'targetRoleSource' ||
          field === 'experienceLevel',
      );
    }

    return [];
  }

  private normalizeOnboardingMissingField(field: string): string {
    if (field === 'CAREER_GOAL') {
      return 'careerGoal';
    }

    if (field === 'TARGET_ROLE') {
      return 'targetRole';
    }

    if (field === 'TARGET_ROLE_LABEL') {
      return 'targetRoleLabel';
    }

    if (field === 'TARGET_ROLE_ID') {
      return 'targetRoleId';
    }

    if (field === 'TARGET_ROLE_SOURCE') {
      return 'targetRoleSource';
    }

    if (field === 'EXPERIENCE_LEVEL') {
      return 'experienceLevel';
    }

    return field;
  }
}
