import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Dashboard — EventSync',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'create-event',
    title: 'Create Event — EventSync',
    loadComponent: () =>
      import('./features/create-event/create-event').then((c) => c.CreateEvent),
  },
  {
    path: 'my-bookings',
    title: 'My Bookings — EventSync',
    loadComponent: () =>
      import('./features/my-bookings/my-bookings').then((c) => c.MyBookings),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
