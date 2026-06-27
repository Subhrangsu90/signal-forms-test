import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../environments/environment';
import { EventService, EventListItem } from '../../shared/services/event.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly appName = environment.appName;
  private readonly eventService = inject(EventService);

  private readonly refreshTrigger = signal(0);

  protected readonly eventsResource = resource({
    params: () => ({ refresh: this.refreshTrigger() }),
    loader: () => this.eventService.getMyEvents(),
  });

  protected readonly events = computed(() => this.eventsResource.value() ?? []);
  protected readonly isLoading = computed(() => this.eventsResource.isLoading());

  protected readonly metrics = computed(() => {
    const events = this.events();
    const totalGuests = events.reduce((sum, e) => sum + e.guests, 0);
    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
    const upcoming = events.filter((e) => e.status === 'upcoming').length;
    const live = events.filter((e) => e.status === 'live').length;

    return [
      { label: 'Total events', value: String(events.length), detail: `${live} live now`, icon: 'event' },
      { label: 'Upcoming', value: String(upcoming), detail: 'Scheduled events', icon: 'schedule' },
      { label: 'Total guests', value: String(totalGuests), detail: 'Across all events', icon: 'groups' },
      { label: 'Revenue', value: this.formatCurrency(totalRevenue), detail: 'Total ticket sales', icon: 'payments' },
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

  protected formatRevenue(value: number): string {
    return '$' + value.toLocaleString();
  }

  protected async deleteEvent(id: string): Promise<void> {
    try {
      await this.eventService.deleteEvent(id);
      this.refreshTrigger.update((v) => v + 1);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
}
