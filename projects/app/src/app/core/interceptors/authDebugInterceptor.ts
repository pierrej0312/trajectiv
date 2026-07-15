import { HttpInterceptorFn } from '@angular/common/http';

export const authDebugInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('========== HTTP ==========');
  console.log(req.url);
  console.log(req.headers.get('Authorization'));

  return next(req);
};
