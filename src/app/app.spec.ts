import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideNativeDateAdapter(),
        provideHttpClient(),
        provideNoopAnimations(),
        importProvidersFrom(MatSnackBarModule),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the create event route for an authenticated user', async () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 'test-user', name: 'Test User', email: 'test@example.com' }),
    );
    localStorage.setItem('auth_token', 'test-token');

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/create-event');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Create Event');
    expect(compiled.querySelector('form')).toBeTruthy();
  });
});
