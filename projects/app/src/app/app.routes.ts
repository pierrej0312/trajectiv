import { Routes } from '@angular/router';
import { authKeycloakGuard } from '@shared/module/keycloak/guards/auth-keycloak.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authKeycloakGuard],
    loadComponent: () => import('./layouts/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/sign-in',
  },
];

const appRoutesExclude = ['Sign-In', 'Sign-Up'];

export const appRoutes = routes.filter(
  (route) =>
    route.data?.['showInNav'] !== false &&
    route.data?.['label'] !== 'Sign-In' &&
    route.data?.['label'] !== 'Sign-Up',
);

