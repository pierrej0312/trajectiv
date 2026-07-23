import type { Routes } from '@angular/router';

import { APP_ACCESS_REQUIREMENTS, type AppRouteData } from '@core';

export const organizationTeamRoutes: Routes = [
  {
    path: '',

    loadComponent: () =>
      import('./pages/organization-team-page/organization-team-page').then(
        ({ OrganizationTeamPage }) => OrganizationTeamPage,
      ),

    data: {
      shellMode: 'app',

      pageTitle: 'Équipe',
      pageSubtitle: 'Membres, rôles et invitations',
      pageIcon: 'pi pi-users',

      parentNavItemId: 'organization-members',

      breadcrumb: {
        label: 'Équipe',
        icon: 'pi pi-users',
        clickable: false,
      },

      access: APP_ACCESS_REQUIREMENTS.memberRead,
    } satisfies AppRouteData,
  },
];
