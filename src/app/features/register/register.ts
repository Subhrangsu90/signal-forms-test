import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');

    if (this.password() !== this.confirmPassword()) {
      const message = 'Passwords do not match';
      this.error.set(message);
      this.toast.error(message);
      return;
    }

    if (this.password().length < 6) {
      const message = 'Password must be at least 6 characters';
      this.error.set(message);
      this.toast.error(message);
      return;
    }

    this.loading.set(true);

    try {
      await this.authService.register(this.name(), this.email(), this.password());
      this.toast.success('Account created successfully.');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      const message = err?.error?.error || 'Registration failed. Please try again.';
      this.error.set(message);
      this.toast.error(message);
    } finally {
      this.loading.set(false);
    }
  }
}
