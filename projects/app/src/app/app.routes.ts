import { Routes } from '@angular/router';
import { authKeycloakGuard } from '@shared/module/keycloak/guards/auth-keycloak.guard';
import { onboardingCompletedGuard } from '@app/src/app/core/guards/onboarding-completed.guard';
import { onboardingIncompleteGuard } from '@app/src/app/core/guards/onboarding-incomplete.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
  },
  {
    path: 'app',
    canActivate: [authKeycloakGuard],
    loadComponent: () => import('./layouts/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: 'onboarding',
        canActivate: [onboardingIncompleteGuard],
        loadComponent: () =>
          import('./pages/onboarding-page/onboarding-page').then((m) => m.OnboardingPage),
      },
      {
        path: '',
        canActivateChild: [onboardingCompletedGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            title: 'Dashboard',
            loadComponent: () =>
              import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
          },
          {
            path: 'opportunities',
            title: 'Opportunités',
            loadComponent: () =>
              import('./pages/opportunities-page/opportunities-page').then(
                (m) => m.OpportunitiesPage,
              ),
          },
          {
            path: 'opportunities/new',
            title: 'Nouvelle opportunité',
            loadComponent: () =>
              import('./pages/opportunity-create-page/opportunity-create-page').then(
                (m) => m.OpportunityCreatePage,
              ),
          },
          {
            path: 'questions',
            title: 'Questions',
            loadComponent: () =>
              import('./pages/questions-page/questions-page').then((m) => m.QuestionsPage),
          },
          {
            path: 'questions/radar',
            title: 'Radar questions',
            loadComponent: () =>
              import('./pages/questions-radar-page/questions-radar-page').then(
                (m) => m.QuestionsRadarPage,
              ),
          },
          {
            path: 'questions/training',
            title: 'Training',
            loadComponent: () =>
              import('./pages/questions-training-page/questions-training-page').then(
                (m) => m.QuestionsTrainingPage,
              ),
          },
          {
            path: 'actions',
            title: 'Actions',
            loadComponent: () =>
              import('./pages/actions-page/actions-page').then((m) => m.ActionsPage),
          },
          {
            path: 'notifications',
            title: 'Notifications',
            loadComponent: () =>
              import('./pages/notifications-page/notifications-page').then(
                (m) => m.NotificationsPage,
              ),
          },
          {
            path: 'settings',
            title: 'Settings',
            loadComponent: () =>
              import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
          },
          {
            path: 'profile',
            title: 'Profil',
            loadComponent: () =>
              import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
          },
          {
            path: 'account',
            title: 'Compte',
            loadComponent: () =>
              import('./pages/account-page/account-page').then((m) => m.AccountPage),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'app',
  },
];

const appRoutesExclude = ['Sign-In', 'Sign-Up'];

export const appRoutes = routes.filter(
  (route) =>
    route.data?.['showInNav'] !== false &&
    route.data?.['label'] !== 'Sign-In' &&
    route.data?.['label'] !== 'Sign-Up',
);

