import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface BookingItem {
  id: string;
  quantity: number;
  totalPrice: string;
  bookedAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    format: string;
    category: string;
    status: string;
    venueName: string | null;
    venueCity: string | null;
    streamUrl: string | null;
    startTime: string;
    endTime: string;
    organizer: string;
  };
  ticketTier: {
    id: string;
    tierName: string;
    price: string;
    quantity: number;
  };
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);

  /** Auth — get the current user's bookings with event details. */
  getMyBookings(): Promise<BookingItem[]> {
    return firstValueFrom(this.http.get<BookingItem[]>('/api/bookings/my'));
  }

  /** Auth — book tickets for an event. */
  bookEvent(eventId: string, ticketTierId: string, quantity: number): Promise<any> {
    return firstValueFrom(
      this.http.post('/api/bookings', { eventId, ticketTierId, quantity }),
    );
  }

  /** Auth — cancel a booking. */
  cancelBooking(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`/api/bookings/${id}`));
  }
}
