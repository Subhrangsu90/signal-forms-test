import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EventService, EventListItem } from '../../shared/services/event.service';
import { BookingService } from '../../shared/services/booking.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-explore-events',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './explore-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreEvents {
  private readonly eventService = inject(EventService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = this.authService.isLoggedIn;
  protected readonly bookingInProgress = signal<string | null>(null);
  protected readonly bookingSuccess = signal<string | null>(null);

  protected readonly eventsResource = resource({
    loader: () => this.eventService.getAllEvents(),
  });

  protected readonly events = computed(() => this.eventsResource.value() ?? []);
  protected readonly isLoading = computed(() => this.eventsResource.isLoading());

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected formatRevenue(value: number): string {
    return '$' + value.toLocaleString();
  }

  protected async bookEvent(event: EventListItem): Promise<void> {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!event.ticketTiers.length) {
      return;
    }

    this.bookingInProgress.set(event.id);
    this.bookingSuccess.set(null);

    try {
      // Book 1 ticket of the first tier by default
      await this.bookingService.bookEvent(event.id, event.ticketTiers[0].id, 1);
      this.bookingSuccess.set(event.id);

      setTimeout(() => this.bookingSuccess.set(null), 3000);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      this.bookingInProgress.set(null);
    }
  }
}
