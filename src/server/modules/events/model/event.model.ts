export interface EventErrorResponse {
  statusCode: number;
  message: string;
}

export class EventError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'EventError';
  }
}

export type EventStatus = 'upcoming' | 'live' | 'completed';

export interface EventListItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  format: string;
  category: string;
  status: string;
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
  createdAt: Date;
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
    bookedAt: Date;
  }>;
}
