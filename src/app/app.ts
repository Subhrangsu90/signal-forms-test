import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  protected readonly isMobile = signal(false);

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe('(max-width: 959px)').subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/create-event', label: 'Create Event', icon: 'add_circle' },
    { path: '/my-bookings', label: 'My Bookings', icon: 'confirmation_number' },
  ];

  protected onNavClick(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }
}
