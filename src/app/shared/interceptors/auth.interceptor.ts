import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Functional HTTP interceptor that attaches the JWT token
 * from localStorage to all outgoing /api/ requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Only attach token in the browser (not during SSR)
  if (isPlatformBrowser(platformId) && req.url.includes('/api/')) {
    const token = localStorage.getItem('auth_token');

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(cloned);
    }
  }

  return next(req);
};
