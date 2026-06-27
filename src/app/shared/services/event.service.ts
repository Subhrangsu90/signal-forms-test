import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface EventListItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  format: 'in-person' | 'virtual' | 'hybrid';
  category: string;
  status: 'upcoming' | 'live' | 'completed';
  venueName: string | null;
  venueCity: string | null;
  streamUrl: string | null;
  startTime: string;
  endTime: string;
  guests: number;
  ticketTiers: Array<{ id: string; tierName: string; price: string; quantity: number }>;
  ticketsLeft: number;
  ticketsSold: number;
  revenue: number;
  createdAt: string;
}

export interface EventSalesReport {
  event: {
    id: string;
    title: string;
    date: string;
    status: string;
  };
  totals: {
    ticketsLeft: number;
    ticketsSold: number;
    revenue: number;
    buyers: number;
  };
  tickets: Array<{
    id: string;
    tierName: string;
    price: string;
    left: number;
    sold: number;
    revenue: number;
  }>;
  buyers: Array<{
    bookingId: string;
    userId: string;
    name: string;
    email: string;
    ticketTier: string;
    quantity: number;
    totalPrice: string;
    bookedAt: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  /** Public — get all events. */
  getAllEvents(): Promise<EventListItem[]> {
    return firstValueFrom(this.http.get<EventListItem[]>('/api/events'));
  }

  /** Auth — get events created by the logged-in user. */
  getMyEvents(): Promise<EventListItem[]> {
    return firstValueFrom(this.http.get<EventListItem[]>('/api/events/my'));
  }

  /** Public — get a single event by ID. */
  getEvent(id: string): Promise<any> {
    return firstValueFrom(this.http.get(`/api/events/${id}`));
  }

  /** Auth — get sales, inventory, and buyer details for an owned event. */
  getEventSales(id: string): Promise<EventSalesReport> {
    return firstValueFrom(this.http.get<EventSalesReport>(`/api/events/${id}/sales`));
  }

  /** Auth — create a new event. */
  createEvent(data: any): Promise<any> {
    return firstValueFrom(this.http.post('/api/events', data));
  }

  /** Auth — update an existing event. */
  updateEvent(id: string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`/api/events/${id}`, data));
  }

  /** Auth — delete an event. */
  deleteEvent(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`/api/events/${id}`));
  }

  /** Auth — update event status. */
  updateStatus(id: string, status: string): Promise<any> {
    return firstValueFrom(this.http.patch(`/api/events/${id}/status`, { status }));
  }
}
