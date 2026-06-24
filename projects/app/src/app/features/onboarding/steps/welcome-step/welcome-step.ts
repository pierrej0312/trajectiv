import { Component, computed, inject, signal } from '@angular/core';
import { OnboardingStore } from '@features/onboarding/store/onboarding.store';
import { AppContextStore } from '@core';
import { Panel } from 'primeng/panel';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

type WelcomeScene = 'identity-check' | 'rename' | 'identity-confirmed' | 'welcome-reveal' | 'ready';

type WelcomeTimelineItem = {
  readonly icon: string;
  readonly label: string;
  readonly text: string;
};

@Component({
  selector: 'app-welcome-step',
  imports: [Panel, InputText, Button, Card],
  templateUrl: './welcome-step.html',
  styleUrl: './welcome-step.css',
})
export class WelcomeStep {
  readonly appContext = inject(AppContextStore);
  readonly store = inject(OnboardingStore);

  readonly scene = signal<WelcomeScene>('identity-check');
  readonly revealedStepCount = signal(0);

  readonly displayNamePreview = computed(() => {
    return this.store.displayName().trim() || this.store.suggestedDisplayName() || 'toi';
  });

  readonly isIdentityConfirmed = computed(() => {
    return (
      this.scene() === 'identity-confirmed' ||
      this.scene() === 'welcome-reveal' ||
      this.scene() === 'ready'
    );
  });

  readonly showWelcomePanel = computed(() => {
    return this.scene() === 'welcome-reveal' || this.scene() === 'ready';
  });

  readonly canValidateName = computed(() => {
    return this.store.displayName().trim().length >= 2;
  });

  readonly timelineItems: readonly WelcomeTimelineItem[] = [
    {
      icon: 'pi pi-user',
      label: 'Avatar',
      text: 'Tu pourras personnaliser ton espace, sans obligation.',
    },
    {
      icon: 'pi pi-compass',
      label: 'Objectif',
      text: 'On clarifie ce que tu veux atteindre maintenant.',
    },
    {
      icon: 'pi pi-briefcase',
      label: 'Rôle ou métier',
      text: 'Trajectiv adapte ses conseils au poste que tu vises.',
    },
    {
      icon: 'pi pi-chart-line',
      label: 'Niveau',
      text: 'L’accompagnement s’ajuste à ton expérience actuelle.',
    },
  ];

  confirmIdentity(): void {
    const suggestedName = this.store.suggestedDisplayName();

    if (!this.store.displayName().trim() && suggestedName) {
      this.store.setDisplayName(suggestedName);
    }

    this.scene.set('identity-confirmed');

    window.setTimeout(() => {
      this.revealWelcomePanel();
    }, 600);
  }

  chooseAnotherName(): void {
    const suggestedName = this.store.suggestedDisplayName();

    if (!this.store.displayName().trim() && suggestedName) {
      this.store.setDisplayName(suggestedName);
    }

    this.scene.set('rename');
  }

  validateName(): void {
    if (!this.canValidateName()) {
      return;
    }

    this.scene.set('identity-confirmed');

    window.setTimeout(() => {
      this.revealWelcomePanel();
    }, 600);
  }

  onNameInput(value: string): void {
    this.store.setDisplayName(value);
  }

  onNameKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    this.validateName();
  }

  startOnboarding(): void {
    this.store.goNext();
  }

  private revealWelcomePanel(): void {
    this.scene.set('welcome-reveal');
    this.revealedStepCount.set(0);

    window.setTimeout(() => {
      this.revealNextStep();
    }, 420);
  }

  private revealNextStep(): void {
    const nextCount = this.revealedStepCount() + 1;

    this.revealedStepCount.set(nextCount);

    if (nextCount >= this.timelineItems.length) {
      window.setTimeout(() => {
        this.scene.set('ready');
      }, 500);

      return;
    }

    window.setTimeout(() => {
      this.revealNextStep();
    }, 360);
  }
}
