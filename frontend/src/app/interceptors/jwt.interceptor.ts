import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // On lit directement le localStorage pour éviter la dépendance circulaire avec HttpClient
  const userStr = localStorage.getItem('currentUser');
  let token = null;
  
  if (userStr) {
    try {
      token = JSON.parse(userStr).token;
    } catch(e) {}
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
