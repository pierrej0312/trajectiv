import { Routes } from '@angular/router';

import { OnboardingPage } from '@app/src/app/pages/onboarding-page/onboarding-page';

export const onboardingRoutes: Routes = [
  {
    path: '',
    component: OnboardingPage,
    children: [
      {
        path: 'welcome',
        loadComponent: () => import('./steps/welcome-step/welcome-step').then((m) => m.WelcomeStep),
      },
      {
        path: 'avatar',
        loadComponent: () => import('./steps/avatar-step/avatar-step').then((m) => m.AvatarStep),
      },
      {
        path: 'goal',
        loadComponent: () => import('./steps/goal-step/goal-step').then((m) => m.GoalStep),
      },
      {
        path: 'target-role',
        loadComponent: () =>
          import('./steps/target-role-step/target-role-step').then((m) => m.TargetRoleStep),
      },
      {
        path: 'experience-level',
        loadComponent: () =>
          import('./steps/experience-level-step/experience-level-step').then(
            (m) => m.ExperienceLevelStep,
          ),
      },
      {
        path: 'review',
        loadComponent: () => import('./steps/review-step/review-step').then((m) => m.ReviewStep),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome',
      },
    ],
  },
];
