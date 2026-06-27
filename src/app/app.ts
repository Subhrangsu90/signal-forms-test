import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from './shared/services/auth.service';

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
  @ViewChild('sidenav') sidenav!: MatSidenav;

  protected readonly authService = inject(AuthService);
  protected readonly isMobile = signal(false);
  protected readonly isLoggedIn = this.authService.isLoggedIn;
  protected readonly currentUser = this.authService.currentUser;

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe('(max-width: 959px)').subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  /** Public nav links — always visible. */
  protected readonly publicLinks = [
    { path: '/explore', label: 'Explore Events', icon: 'travel_explore' },
  ];

  /** Auth nav links — only when logged in. */
  protected readonly authLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/create-event', label: 'Create Event', icon: 'add_circle' },
    { path: '/my-bookings', label: 'My Bookings', icon: 'confirmation_number' },
  ];

  /** Guest nav links — only when logged out. */
  protected readonly guestLinks = [
    { path: '/login', label: 'Sign In', icon: 'login' },
    { path: '/register', label: 'Create Account', icon: 'person_add' },
  ];

  protected readonly navLinks = computed(() => {
    if (this.isLoggedIn()) {
      return [...this.publicLinks, ...this.authLinks];
    }
    return [...this.publicLinks, ...this.guestLinks];
  });

  protected onNavClick(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
