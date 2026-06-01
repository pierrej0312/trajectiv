import { Routes } from '@angular/router';
import { authKeycloakGuard } from '@shared/module/keycloak/guards/auth-keycloak.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    data: { showInNav: false },
    loadComponent: () => import('./pages/sign-in-page/sign-in-page').then((m) => m.SignInPage),
  },
  {
    path: 'sign-Up',
    data: { showInNav: false },
    loadComponent: () => import('./pages/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: '',
    canActivate: [authKeycloakGuard],
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
    ]
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

