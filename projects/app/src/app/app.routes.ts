import type { Routes } from '@angular/router';

import { APP_ACCESS_REQUIREMENTS, type AppRouteData } from '@core';

import { AppLayout } from './layouts/app-layout/app-layout';

import { authKeycloakGuard } from '@shared/module/keycloak/guards/auth-keycloak.guard';

import { isAllowedChildGuard } from '@shared/module/keycloak/guards/is-access-allowed.guard';

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
          shellMode: 'onboarding',
          pageTitle: 'Configuration de ton espace',
          hideSearch: true,
        } satisfies AppRouteData,

        loadChildren: () =>
          import('./features/onboarding/onboarding.routes').then(
            ({ onboardingRoutes }) => onboardingRoutes,
          ),
      },
      {
        path: '',
        canActivateChild: [onboardingCompletedGuard, isAllowedChildGuard],

        data: {
          shellMode: 'app',
        } satisfies AppRouteData,

        children: [
          {
            path: 'dashboard',

            data: {
              pageTitle: 'Pilotage',
              pageSubtitle: 'Ta trajectoire en un coup d’œil',
              pageIcon: 'pi pi-chart-line',
              parentNavItemId: 'dashboard',

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadChildren: () =>
              import('./features/dashboard/dashboard.routes').then(
                ({ dashboardRoutes }) => dashboardRoutes,
              ),
          },
          {
            path: 'opportunities',

            data: {
              pageTitle: 'Opportunités',
              pageSubtitle: 'Analyse et suis les opportunités qui comptent',
              pageIcon: 'pi pi-bullseye',
              parentNavItemId: 'opportunities',
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/opportunities-page/opportunities-page').then(
                ({ OpportunitiesPage }) => OpportunitiesPage,
              ),
          },
          {
            path: 'opportunities/new',

            data: {
              pageTitle: 'Nouvelle opportunité',
              pageSubtitle: 'Ajoute une offre à analyser et à suivre',
              pageIcon: 'pi pi-plus',
              parentNavItemId: 'opportunities',
              showBackButton: true,
              hideSearch: true,

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/opportunity-create-page/opportunity-create-page').then(
                ({ OpportunityCreatePage }) => OpportunityCreatePage,
              ),
          },
          {
            path: 'questions/radar',

            data: {
              pageTitle: 'Radar de questions',
              pageSubtitle: 'Identifie les sujets à préparer en priorité',
              pageIcon: 'pi pi-compass',
              parentNavItemId: 'questions',
              showBackButton: true,

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/questions-radar-page/questions-radar-page').then(
                ({ QuestionsRadarPage }) => QuestionsRadarPage,
              ),
          },
          {
            path: 'questions/training',

            data: {
              pageTitle: 'Entraînement',
              pageSubtitle: 'Transforme tes connaissances en réponses solides',
              pageIcon: 'pi pi-microphone',
              parentNavItemId: 'questions',
              showBackButton: true,
              hideSearch: true,

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/questions-training-page/questions-training-page').then(
                ({ QuestionsTrainingPage }) => QuestionsTrainingPage,
              ),
          },
          {
            path: 'questions',

            data: {
              pageTitle: 'Questions',
              pageSubtitle: 'Prépare les questions les plus probables',
              pageIcon: 'pi pi-comments',
              parentNavItemId: 'questions',

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/questions-page/questions-page').then(
                ({ QuestionsPage }) => QuestionsPage,
              ),
          },
          {
            path: 'actions',

            data: {
              pageTitle: 'Actions',
              pageSubtitle: 'Les prochaines étapes recommandées pour avancer',
              pageIcon: 'pi pi-sparkles',
              parentNavItemId: 'actions',

              access: APP_ACCESS_REQUIREMENTS.personalWorkspace,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/actions-page/actions-page').then(({ ActionsPage }) => ActionsPage),
          },
          {
            path: 'notifications',

            data: {
              pageTitle: 'Notifications',
              pageSubtitle: 'Retrouve les événements importants de ton parcours',
              pageIcon: 'pi pi-bell',
              parentNavItemId: 'notifications',
              hideSearch: true,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/notifications-page/notifications-page').then(
                ({ NotificationsPage }) => NotificationsPage,
              ),
          },

          {
            path: 'profile',

            data: {
              pageTitle: 'Profil',
              pageSubtitle: 'Fais évoluer ton objectif et ton identité professionnelle',
              pageIcon: 'pi pi-user',
              parentNavItemId: 'profile',
              hideSearch: true,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/profile-page/profile-page').then(({ ProfilePage }) => ProfilePage),
          },

          {
            path: 'account',

            data: {
              pageTitle: 'Compte',
              pageSubtitle: 'Gère ton identité et la sécurité de ton compte',
              pageIcon: 'pi pi-id-card',
              parentNavItemId: 'account',
              hideSearch: true,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/account-page/account-page').then(({ AccountPage }) => AccountPage),
          },

          {
            path: 'settings',

            data: {
              pageTitle: 'Paramètres',
              pageSubtitle: 'Personnalise ton expérience Trajectiv',
              pageIcon: 'pi pi-cog',
              parentNavItemId: 'settings',
              hideSearch: true,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/settings-page/settings-page').then(
                ({ SettingsPage }) => SettingsPage,
              ),
          },

          {
            path: 'organization',

            data: {
              breadcrumb: {
                label: 'Organisation',
                icon: 'pi pi-building',
              },

              access: APP_ACCESS_REQUIREMENTS.organizationWorkspace,
            } satisfies AppRouteData,

            children: [
              {
                path: '',

                data: {
                  pageTitle: 'Organisation',
                  pageSubtitle: 'Pilote les activités de ton espace',
                  pageIcon: 'pi pi-building',
                  parentNavItemId: 'organization-dashboard',
                } satisfies AppRouteData,

                loadComponent: () =>
                  import('./pages/organization-page/organization-page').then(
                    ({ OrganizationPage }) => OrganizationPage,
                  ),
              },

              {
                path: 'team',

                loadChildren: () =>
                  import('@features/organization/team/ organization-team.routes').then(
                    (m) => m.organizationTeamRoutes,
                  ),
              },
            ],
          },

          /*
          {
            path: 'organization',
            canActivate: [
              isAllowedGuard,
            ],

            data: {
              shellMode: 'app',
              pageTitle: 'Organisation',
              pageIcon: 'pi pi-building',

              access:
                APP_ACCESS_REQUIREMENTS.organizationWorkspace,
            } satisfies AppRouteData,

            loadChildren: () =>
              import(
                './features/organization/organization.routes'
              ).then(
                ({ organizationRoutes }) =>
                  organizationRoutes,
              ),
          },
          {
            path: 'organization/settings',

            data: {
              shellMode: 'app',
              pageTitle:
                'Paramètres de l’organisation',
              pageIcon: 'pi pi-cog',

              access:
                APP_ACCESS_REQUIREMENTS
                  .organizationAdministration,
            } satisfies AppRouteData,

            loadComponent: () =>
              import(
                './features/organization/pages/organization-settings-page'
              ).then(
                ({ OrganizationSettingsPage }) =>
                  OrganizationSettingsPage,
              ),
          },
          {
            path: 'admin',

            data: {
              shellMode: 'app',
              pageTitle:
                'Administration Trajectiv',
              pageIcon: 'pi pi-shield',

              access:
                APP_ACCESS_REQUIREMENTS
                  .platformAdministration,
            } satisfies AppRouteData,

            loadChildren: () =>
              import(
                './features/admin/admin.routes'
              ).then(
                ({ adminRoutes }) =>
                  adminRoutes,
              ),
          },
           */

          {
            path: 'access-denied',

            data: {
              shellMode: 'app',
              pageTitle: 'Accès impossible',
              hideSearch: true,
            } satisfies AppRouteData,

            loadComponent: () =>
              import('./pages/access-denied-page/access-denied-page').then(
                ({ AccessDeniedPage }) => AccessDeniedPage,
              ),
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
