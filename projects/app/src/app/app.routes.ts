import { Routes } from '@angular/router';

import { AppLayout } from './layouts/app-layout/app-layout';
import { authKeycloakGuard } from './shared/module/keycloak/guards/auth-keycloak.guard';
import { onboardingCompletedGuard } from './core/guards/onboarding-completed.guard';
import { onboardingIncompleteGuard } from './core/guards/onboarding-incomplete.guard';

export const routes: Routes = [
  {
    path: 'app',
    canActivate: [authKeycloakGuard],
    component: AppLayout,
    children: [
      {
        path: 'onboarding',
        canActivate: [onboardingIncompleteGuard],
        data: {
          shell: 'onboarding',
        },
        loadChildren: () =>
          import('./features/onboarding/onboarding.routes').then((m) => m.onboardingRoutes),
      },
      {
        path: '',
        canActivateChild: [onboardingCompletedGuard],
        data: {
          shell: 'app',
        },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
          },
          {
            path: 'opportunities',
            loadComponent: () =>
              import('./pages/opportunities-page/opportunities-page').then(
                (m) => m.OpportunitiesPage,
              ),
          },
          {
            path: 'opportunities/new',
            loadComponent: () =>
              import('./pages/opportunity-create-page/opportunity-create-page').then(
                (m) => m.OpportunityCreatePage,
              ),
          },
          {
            path: 'questions',
            loadComponent: () =>
              import('./pages/questions-page/questions-page').then((m) => m.QuestionsPage),
          },
          {
            path: 'questions/radar',
            loadComponent: () =>
              import('./pages/questions-radar-page/questions-radar-page').then(
                (m) => m.QuestionsRadarPage,
              ),
          },
          {
            path: 'questions/training',
            loadComponent: () =>
              import('./pages/questions-training-page/questions-training-page').then(
                (m) => m.QuestionsTrainingPage,
              ),
          },
          {
            path: 'actions',
            loadComponent: () =>
              import('./pages/actions-page/actions-page').then((m) => m.ActionsPage),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./pages/notifications-page/notifications-page').then(
                (m) => m.NotificationsPage,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
          },
          {
            path: 'account',
            loadComponent: () =>
              import('./pages/account-page/account-page').then((m) => m.AccountPage),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
        ],
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/dashboard',
  },
  {
    path: '**',
    redirectTo: 'app/dashboard',
  },
];

// const appRoutesExclude = ['Sign-In', 'Sign-Up'];
//
// export const appRoutes = routes.filter(
//   (route) =>
//     route.data?.['showInNav'] !== false &&
//     route.data?.['label'] !== 'Sign-In' &&
//     route.data?.['label'] !== 'Sign-Up',
// );

