import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'client-intake',
  },
  {
    path: 'client-intake',
    title: 'Client Intake',
    loadComponent: () =>
      import('./features/client-intake/client-intake').then((component) => component.ClientIntake),
  },
  {
    path: 'user-details',
    title: 'User Details',
    loadComponent: () => import('./features/user-details/user-details').then((component) => component.UserDetails),
  },
  {
    path: '**',
    redirectTo: 'client-intake',
  },
];
