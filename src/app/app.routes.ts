import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'explore',
  },
  {
    path: 'explore',
    title: 'Explore Events — EventSync',
    loadComponent: () =>
      import('./features/explore-events/explore-events').then((c) => c.ExploreEvents),
  },
  {
    path: 'login',
    title: 'Sign In — EventSync',
    loadComponent: () =>
      import('./features/login/login').then((c) => c.Login),
  },
  {
    path: 'register',
    title: 'Create Account — EventSync',
    loadComponent: () =>
      import('./features/register/register').then((c) => c.Register),
  },
  {
    path: 'dashboard',
    title: 'Dashboard — EventSync',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'create-event',
    title: 'Create Event — EventSync',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/create-event/create-event').then((c) => c.CreateEvent),
  },
  {
    path: 'my-bookings',
    title: 'My Bookings — EventSync',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/my-bookings/my-bookings').then((c) => c.MyBookings),
  },
  {
    path: '**',
    redirectTo: 'explore',
  },
];
