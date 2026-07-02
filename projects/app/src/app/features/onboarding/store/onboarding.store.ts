import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, finalize, switchMap, tap } from 'rxjs';

import {
  OnboardingControllerService,
  ProfileControllerService,
  UpdateMeProfileRequestApiDto,
} from '@shared-api-client';
import { AppContextStore } from '@core';
import { CompanionAnimationCommand } from '@shared/companion/models/companion-animation.model';

type CareerGoal = UpdateMeProfileRequestApiDto.CareerGoalEnum;
type ExperienceLevel = UpdateMeProfileRequestApiDto.ExperienceLevelEnum;

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

  readonly currentUrl = signal(this.normalizeUrl(this.router.url));

  readonly displayName = signal('');
  readonly careerGoal = signal<CareerGoal | null>(null);
  readonly targetRole = signal('');
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

  readonly canComplete = computed(() => {
    return (
      this.careerGoal() !== null &&
      this.targetRole().trim().length >= 2 &&
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
      return this.targetRole().trim().length >= 2;
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

  setTargetRole(value: string): void {
    this.targetRole.set(value);
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
      return this.targetRole().trim().length >= 2;
    }

    if (key === 'experience-level') {
      return this.experienceLevel() !== null;
    }

    if (key === 'review') {
      return (
        this.careerGoal() !== null &&
        this.targetRole().trim().length >= 2 &&
        this.experienceLevel() !== null
      );
    }

    return false;
  }

  complete(): void {
    if (!this.canComplete()) {
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
