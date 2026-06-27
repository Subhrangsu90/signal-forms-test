import { ChangeDetectionStrategy, Component, computed, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { AuthService } from './shared/services/auth.service';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  @ViewChild('sidenav') sidenav?: MatSidenav;

  protected readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly toast = inject(ToastService);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 959px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );
  protected readonly isLoggedIn = this.authService.isLoggedIn;
  protected readonly currentUser = this.authService.currentUser;

  protected readonly publicLinks = [
    { path: '/explore', label: 'Explore Events', icon: 'travel_explore' },
  ];

  protected readonly authLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/create-event', label: 'Create Event', icon: 'add_circle' },
    { path: '/my-bookings', label: 'My Bookings', icon: 'confirmation_number' },
  ];

  protected readonly guestLinks = [
    { path: '/login', label: 'Sign In', icon: 'login' },
    { path: '/register', label: 'Create Account', icon: 'person_add' },
  ];

  protected readonly navLinks = computed(() => {
    if (this.isLoggedIn()) {
      return [...this.publicLinks, ...this.authLinks];
    }
    return this.publicLinks;
  });

  protected onNavClick(): void {
    if (this.isMobile()) {
      void this.sidenav?.close();
    }
  }

  protected logout(): void {
    this.authService.logout();
    this.toast.success('Signed out successfully.');
    this.onNavClick();
  }
}