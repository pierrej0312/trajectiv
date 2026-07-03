import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
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
import { CompanionAnimationCommand } from '@shared/companion/models/companion-animation.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

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

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
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

  readonly currentUrl = signal(this.normalizeUrl(this.router.url));

  readonly displayName = signal('');
  readonly careerGoal = signal<CareerGoal | null>(null);

  readonly targetRoleQuery = signal('');
  readonly targetRoleFamily = signal<JobRoleFamily | null>(null);
  readonly targetRoleSelection = signal<TargetRoleSelection | null>(null);
  readonly targetRoleSuggestions = signal<readonly JobRoleSuggestionApiDto[]>([]);
  readonly isSearchingTargetRoles = signal(false);
  readonly targetRoleSearchMessage = signal<string | null>(null);

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

  readonly experienceLevel = signal<ExperienceLevel | null>(null);

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

    effect((onCleanup) => {
      const step = this.activeStepKey();

      this.clearIdleDanceTimer();
      this.manualCompanionCommand.set(null);

      if (step === 'welcome') {
        return;
      }

      if (step === 'review') {
        this.playCompanionOnce('victory', 'idle');
      }

      this.scheduleIdleDance();

      onCleanup(() => {
        this.clearIdleDanceTimer();
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
    this.careerGoal.set(value);
  }

  setTargetRoleQuery(value: string): void {
    this.targetRoleQuery.set(value);
    this.searchCurrentTargetRoles();
  }

  setTargetRoleFamily(value: JobRoleFamily | null): void {
    this.targetRoleFamily.set(value);
    this.searchCurrentTargetRoles();
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
    this.targetRoleSearchMessage.set(null);
  }

  setExperienceLevel(value: ExperienceLevel): void {
    this.experienceLevel.set(value);
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

    const nextStep = ONBOARDING_STEPS[this.activeStepIndex() + 1];

    if (!nextStep) {
      return;
    }

    this.setStepDirection('next');
    void this.router.navigateByUrl(nextStep.route);
    document.querySelector('.app-layout')!.scrollTo({ top: 0 });
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

    const selection = this.targetRoleSelection();
    const fallbackLabel = this.targetRoleQuery().trim();

    const payload: UpdateMeProfileRequestApiDto = {
      careerGoal: this.careerGoal() ?? undefined,
      targetRoleId: selection?.source === 'CATALOG' ? selection.id : undefined,
      targetRoleLabel: selection?.label ?? fallbackLabel,
      targetRoleSource: selection?.source ?? 'CUSTOM',
      experienceLevel: this.experienceLevel() ?? undefined,
      preferredLanguage: 'fr',
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.profileApi
      .updateProfile(payload, 'body', false, {
        httpHeaderAccept: 'application/json',
        transferCache: false,
      })
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

  readonly showCompanionStage = computed(() => {
    return this.activeStepKey() !== 'welcome';
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

  playCompanionOnce(
    name: CompanionAnimationCommand['name'],
    fallback: CompanionAnimationCommand['fallback'] = 'idle',
  ): void {
    const id = this.nextAnimationCommandId();

    this.manualCompanionCommand.set({
      id,
      name,
      mode: 'once',
      fallback,
    });
  }

  playCompanionLoop(name: CompanionAnimationCommand['name']): void {
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
}
