import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { from, switchMap } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);

  if (!keycloak.authenticated || !keycloak.refreshToken || !keycloak.isTokenExpired(5)) {
    return next(req);
  }

  return from(keycloak.updateToken(5)).pipe(switchMap(() => next(req)));
};
