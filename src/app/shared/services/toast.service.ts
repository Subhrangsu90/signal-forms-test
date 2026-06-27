import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type ToastKind = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'success');
  }

  error(message: string): void {
    this.open(message, 'error', 5000);
  }

  info(message: string): void {
    this.open(message, 'info');
  }

  apiError(err: unknown, fallback: string): void {
    this.error(this.getApiErrorMessage(err) ?? fallback);
  }

  private open(message: string, kind: ToastKind, duration = 3500): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${kind}`],
    });
  }

  private getApiErrorMessage(err: unknown): string | null {
    if (!err || typeof err !== 'object') {
      return null;
    }

    const maybeHttpError = err as {
      error?: { error?: unknown; message?: unknown } | string;
      message?: unknown;
    };

    if (typeof maybeHttpError.error === 'string') {
      return maybeHttpError.error;
    }

    if (typeof maybeHttpError.error?.error === 'string') {
      return maybeHttpError.error.error;
    }

    if (typeof maybeHttpError.error?.message === 'string') {
      return maybeHttpError.error.message;
    }

    if (typeof maybeHttpError.message === 'string') {
      return maybeHttpError.message;
    }

    return null;
  }
}
