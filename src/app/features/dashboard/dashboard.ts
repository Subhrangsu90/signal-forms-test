import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../environments/environment';
import { EventService, EventListItem, EventSalesReport } from '../../shared/services/event.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly appName = environment.appName;
  private readonly eventService = inject(EventService);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal(0);

  protected readonly selectedEventId = signal<string | null>(null);
  protected readonly salesReport = signal<EventSalesReport | null>(null);
  protected readonly salesLoading = signal(false);

  protected readonly eventsResource = resource({
    params: () => ({ refresh: this.refreshTrigger() }),
    loader: () => this.eventService.getMyEvents(),
  });

  protected readonly events = computed(() => this.eventsResource.value() ?? []);
  protected readonly isLoading = computed(() => this.eventsResource.isLoading());

  protected readonly metrics = computed(() => {
    const events = this.events();
    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
    const ticketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);
    const ticketsLeft = events.reduce((sum, e) => sum + e.ticketsLeft, 0);
    const live = events.filter((e) => e.status === 'live').length;

    return [
      { label: 'Total events', value: String(events.length), detail: `${live} live now`, icon: 'event' },
      { label: 'Tickets sold', value: String(ticketsSold), detail: 'Across all events', icon: 'confirmation_number' },
      { label: 'Tickets left', value: String(ticketsLeft), detail: 'Remaining inventory', icon: 'inventory_2' },
      { label: 'Revenue', value: this.formatCurrency(totalRevenue), detail: 'Actual ticket sales', icon: 'payments' },
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

  protected formatBookedAt(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected formatRevenue(value: number): string {
    return '$' + value.toLocaleString();
  }

  protected async viewSales(event: EventListItem): Promise<void> {
    if (this.selectedEventId() === event.id) {
      this.selectedEventId.set(null);
      this.salesReport.set(null);
      return;
    }

    this.selectedEventId.set(event.id);
    this.salesReport.set(null);
    this.salesLoading.set(true);

    try {
      this.salesReport.set(await this.eventService.getEventSales(event.id));
    } catch (err) {
      this.toast.apiError(err, 'Could not load ticket sales.');
    } finally {
      this.salesLoading.set(false);
    }
  }

  protected async deleteEvent(id: string): Promise<void> {
    try {
      await this.eventService.deleteEvent(id);
      if (this.selectedEventId() === id) {
        this.selectedEventId.set(null);
        this.salesReport.set(null);
      }
      this.refreshTrigger.update((v) => v + 1);
      this.toast.success('Event deleted successfully.');
    } catch (err) {
      this.toast.apiError(err, 'Could not delete event. Please try again.');
    }
  }
}
