import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../environments/environment';
import { BookingService, BookingItem } from '../../shared/services/booking.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './my-bookings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookings {
  protected readonly appName = environment.appName;
  private readonly bookingService = inject(BookingService);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal(0);

  protected readonly bookingsResource = resource({
    params: () => ({ refresh: this.refreshTrigger() }),
    loader: () => this.bookingService.getMyBookings(),
  });

  protected readonly bookings = computed(() => this.bookingsResource.value() ?? []);
  protected readonly isLoading = computed(() => this.bookingsResource.isLoading());

  protected readonly totalSpent = computed(() => {
    return this.bookings().reduce((sum, b) => sum + Number(b.totalPrice), 0);
  });

  protected readonly totalSpentFormatted = computed(() => {
    const value = this.totalSpent();
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  });

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected formatBookedAt(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected async cancelBooking(id: string): Promise<void> {
    try {
      await this.bookingService.cancelBooking(id);
      this.refreshTrigger.update((v) => v + 1);
      this.toast.success('Booking cancelled successfully.');
    } catch (err) {
      this.toast.apiError(err, 'Could not cancel booking. Please try again.');
    }
  }
}
