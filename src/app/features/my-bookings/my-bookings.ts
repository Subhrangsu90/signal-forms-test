import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from '../../../environments/environment';
import { DashboardEvent, sampleEvents } from '../create-event/create-event.model';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './my-bookings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookings {
  protected readonly appName = environment.appName;
  protected readonly bookings = signal<readonly DashboardEvent[]>(sampleEvents);

  protected readonly totalRevenue = computed(() => {
    return this.bookings().reduce((sum, e) => sum + e.revenue, 0);
  });

  protected readonly totalRevenueFormatted = computed(() => {
    const value = this.totalRevenue();
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  });

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected formatRevenue(value: number): string {
    return '$' + value.toLocaleString();
  }
}
