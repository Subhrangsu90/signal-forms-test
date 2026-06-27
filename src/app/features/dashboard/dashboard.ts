import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DashboardEvent, sampleEvents } from '../create-event/create-event.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly appName = environment.appName;
  protected readonly events = signal<readonly DashboardEvent[]>(sampleEvents);

  protected readonly metrics = computed(() => {
    const events = this.events();
    const totalGuests = events.reduce((sum, e) => sum + e.guests, 0);
    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
    const upcoming = events.filter((e) => e.status === 'upcoming').length;
    const live = events.filter((e) => e.status === 'live').length;

    return [
      { label: 'Total events', value: String(events.length), detail: `${live} live now` },
      { label: 'Upcoming', value: String(upcoming), detail: 'Scheduled events' },
      { label: 'Total guests', value: String(totalGuests), detail: 'Across all events' },
      { label: 'Revenue', value: this.formatCurrency(totalRevenue), detail: 'Total ticket sales' },
    ];
  });

  private formatCurrency(value: number): string {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
