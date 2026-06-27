import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /** Current user signal — null when not logged in. */
  readonly currentUser = signal<AuthUser | null>(null);

  /** Computed convenience flag. */
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Register a new account.
   */
  async register(name: string, email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/register', { name, email, password }),
    );
    this.setSession(res);
  }

  /**
   * Log in with email and password.
   */
  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', { email, password }),
    );
    this.setSession(res);
  }

  /**
   * Log out — clear token and redirect to login.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Persist the session to localStorage and update signal. */
  private setSession(res: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
  }

  /** Restore user from localStorage on app startup. */
  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('auth_user');
      if (userJson) {
        try {
          this.currentUser.set(JSON.parse(userJson));
        } catch {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
      }
    }
  }
}
