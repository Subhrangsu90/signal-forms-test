import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  applyEach,
  debounce,
  email,
  form,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  submit,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../environments/environment';
import { EventService } from '../../shared/services/event.service';
import { FormCheckbox, FormInput, FormSelect, FormDatepicker } from '../../shared/form-controls';
import {
  categoryOptions,
  createEventData,
  EventData,
  formatOptions,
  SaveStatus,
  suggestedVenues,
} from './create-event.model';

@Component({
  selector: 'app-create-event',
  imports: [
    FormCheckbox,
    FormInput,
    FormSelect,
    FormDatepicker,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  templateUrl: './create-event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEvent {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  protected readonly appName = environment.appName;
  protected readonly maxTicketTiers = environment.maxTicketTiers;
  protected readonly maxGuests = environment.maxGuests;
  protected readonly categoryOptions = categoryOptions;
  protected readonly formatOptions = formatOptions;

  protected readonly eventModel = signal<EventData>(createEventData());
  protected readonly submittedEvent = signal<EventData | undefined>(undefined);
  protected readonly saveStatus = signal<SaveStatus>('idle');

  private readonly selectedCategory = computed(() => this.eventModel().event.category);
  protected readonly suggestedVenue = linkedSignal(() => suggestedVenues[this.selectedCategory()]);

  protected readonly eventForm = form(this.eventModel, (path) => {
    debounce(path.event.email, 300);
    debounce(path.event.phone, 250);
    debounce(path.extras.promoCode, 400);

    required(path.event.title, { message: 'Event title is required' });
    minLength(path.event.title, 3, { message: 'Use at least 3 characters' });
    maxLength(path.event.title, 80, { message: 'Keep title under 80 characters' });

    required(path.event.organizer, { message: 'Organizer name is required' });
    minLength(path.event.organizer, 2, { message: 'Use at least 2 characters' });

    required(path.event.email, { message: 'Email is required' });
    email(path.event.email, { message: 'Enter a valid email address' });
    validateAsync(path.event.email, {
      params: ({ value }) => value(),
      factory: (emailValue) =>
        resource({
          params: emailValue,
          loader: async ({ params }) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return environment.reservedEmails.includes(params.trim().toLowerCase());
          },
        }),
      onSuccess: (isReserved) =>
        isReserved ? { kind: 'reservedEmail', message: 'This email is already registered as an organizer' } : undefined,
      onError: () => ({ kind: 'emailCheckFailed', message: 'Email check failed' }),
    });

    required(path.event.phone, { message: 'Phone number is required' });
    pattern(path.event.phone, /^\+?[0-9\s-]{7,15}$/, {
      message: 'Use 7-15 digits, spaces, hyphens, or a leading +',
    });

    hidden(path.venue.name, ({ valueOf }) => valueOf(path.event.format) === 'virtual');
    hidden(path.venue.address, ({ valueOf }) => valueOf(path.event.format) === 'virtual');
    hidden(path.venue.city, ({ valueOf }) => valueOf(path.event.format) === 'virtual');
    hidden(path.venue.zipCode, ({ valueOf }) => valueOf(path.event.format) === 'virtual');
    hidden(path.venue.streamUrl, ({ valueOf }) => valueOf(path.event.format) === 'in-person');
    hidden(path.extras.parking, ({ valueOf }) => valueOf(path.event.format) === 'virtual');

    required(path.venue.name, {
      message: 'Venue name is required',
      when: ({ valueOf }) => valueOf(path.event.format) !== 'virtual',
    });
    required(path.venue.address, {
      message: 'Venue address is required',
      when: ({ valueOf }) => valueOf(path.event.format) !== 'virtual',
    });
    required(path.venue.city, {
      message: 'City is required',
      when: ({ valueOf }) => valueOf(path.event.format) !== 'virtual',
    });
    required(path.venue.zipCode, {
      message: 'ZIP code is required',
      when: ({ valueOf }) => valueOf(path.event.format) !== 'virtual',
    });
    pattern(path.venue.zipCode, /^[0-9]{5}(-[0-9]{4})?$/, {
      message: 'Use 12345 or 12345-6789',
    });

    required(path.venue.streamUrl, {
      message: 'Stream URL is required for virtual events',
      when: ({ valueOf }) => valueOf(path.event.format) !== 'in-person',
    });

    required(path.venue.date, { message: 'Event date is required' });
    validate(path.venue.date, ({ value }) => {
      const rawDate = value();
      if (!rawDate) {
        return undefined;
      }

      const eventDate = new Date(rawDate);
      if (Number.isNaN(eventDate.getTime())) {
        return { kind: 'invalidDate', message: 'Enter a valid date' };
      }

      const earliest = new Date();
      earliest.setHours(0, 0, 0, 0);
      earliest.setDate(earliest.getDate() + environment.minEventLeadDays);

      if (eventDate < earliest) {
        return {
          kind: 'leadTime',
          message: `Event needs at least ${environment.minEventLeadDays} days of lead time`,
        };
      }

      return undefined;
    });

    required(path.venue.startTime, { message: 'Start time is required' });
    required(path.venue.endTime, { message: 'End time is required' });
    validate(path.venue.endTime, ({ value, valueOf }) => {
      const end = value();
      const start = valueOf(path.venue.startTime);
      if (!end || !start) {
        return undefined;
      }

      if (end <= start) {
        return { kind: 'timeRange', message: 'End time must be after start time' };
      }

      return undefined;
    });

    applyEach(path.tickets, (ticket) => {
      required(ticket.tierName, { message: 'Tier name is required' });
      min(ticket.price, 0, { message: 'Price cannot be negative' });
      min(ticket.quantity, 1, { message: 'At least 1 ticket required' });
      max(ticket.quantity, 1000, { message: 'Max 1000 tickets per tier' });
    });

    applyEach(path.guests, (guest) => {
      required(guest.name, { message: 'Guest name is required' });
      required(guest.email, { message: 'Guest email is required' });
      email(guest.email, { message: 'Enter a valid email address' });
    });

    validateAsync(path.extras.promoCode, {
      params: ({ value }) => value(),
      factory: (codeValue) =>
        resource({
          params: codeValue,
          loader: async ({ params }) => {
            if (!params.trim()) {
              return 'empty';
            }
            await new Promise((resolve) => setTimeout(resolve, 400));
            return environment.promoCodes.includes(params.trim().toUpperCase()) ? 'valid' : 'invalid';
          },
        }),
      onSuccess: (result) =>
        result === 'invalid' ? { kind: 'invalidPromo', message: 'Promo code not recognized' } : undefined,
      onError: () => ({ kind: 'promoCheckFailed', message: 'Promo check failed' }),
    });

    required(path.terms.agreeToTerms, { message: 'You must agree to the terms' });
  });


  protected readonly completionPercent = computed(() => {
    const event = this.eventModel();
    const values = [
      event.event.title,
      event.event.organizer,
      event.event.email,
      event.event.phone,
      event.event.category,
      event.event.format,
      event.venue.date,
      event.venue.startTime,
      event.venue.endTime,
      ...(event.event.format !== 'virtual'
        ? [event.venue.name, event.venue.address, event.venue.city, event.venue.zipCode]
        : []),
      ...(event.event.format !== 'in-person' ? [event.venue.streamUrl] : []),
      ...event.tickets.flatMap((t) => [t.tierName, String(t.price), String(t.quantity)]),
      ...event.guests.flatMap((g) => [g.name, g.email]),
    ];
    const completed = values.filter((v: any) => {
      if (!v) {
        return false;
      }
      const str = typeof v === 'string' ? v : (v instanceof Date ? v.toISOString() : String(v));
      return str.trim().length > 0;
    }).length;
    return Math.round((completed / values.length) * 100);
  });

  protected readonly totalRevenue = computed(() => {
    return this.eventModel().tickets.reduce((sum, tier) => sum + tier.price * tier.quantity, 0);
  });

  protected readonly totalRevenueFormatted = computed(() => {
    const value = this.totalRevenue();
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  });

  protected readonly selectedExtras = computed(() => {
    const extras = this.eventModel().extras;
    return [
      extras.catering ? 'Catering' : '',
      extras.parking ? 'Parking' : '',
      extras.recording ? 'Recording' : '',
    ].filter(Boolean);
  });

  protected readonly submittedJson = computed(() => {
    const event = this.submittedEvent();
    return event ? JSON.stringify(event, null, 2) : '';
  });

  protected useSuggestedVenue(): void {
    this.eventModel.update((data) => ({
      ...data,
      venue: {
        ...data.venue,
        name: this.suggestedVenue(),
      },
    }));
  }

  protected addTicketTier(): void {
    this.eventModel.update((data) => ({
      ...data,
      tickets: [...data.tickets, { tierName: '', price: 0, quantity: 1 }],
    }));
  }

  protected removeTicketTier(index: number): void {
    this.eventModel.update((data) => ({
      ...data,
      tickets: data.tickets.filter((_, i) => i !== index),
    }));
  }

  protected addGuest(): void {
    this.eventModel.update((data) => ({
      ...data,
      guests: [...data.guests, { name: '', email: '' }],
    }));
  }

  protected removeGuest(index: number): void {
    this.eventModel.update((data) => ({
      ...data,
      guests: data.guests.filter((_, i) => i !== index),
    }));
  }

  protected resetForm(): void {
    this.eventModel.set(createEventData());
    this.eventForm().reset();
    this.submittedEvent.set(undefined);
    this.saveStatus.set('idle');
  }

  protected onSubmit(): void {
    submit(this.eventForm, async () => {
      this.saveStatus.set('saving');
      try {
        const result = await this.eventService.createEvent(this.eventModel());
        this.submittedEvent.set(this.eventModel());
        this.saveStatus.set('saved');
        // Navigate to dashboard after a short delay so user sees the success state
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      } catch (err) {
        console.error('Create event failed:', err);
        this.saveStatus.set('idle');
      }
    });
  }
}
