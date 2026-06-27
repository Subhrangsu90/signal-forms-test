export interface EventTicketDto {
  tierName: string;
  price: number | string;
  quantity: number;
}

export interface EventGuestDto {
  name: string;
  email: string;
}

export interface EventPayloadDto {
  event: {
    title: string;
    organizer: string;
    email: string;
    phone: string;
    category: string;
    format: string;
  };
  venue: {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    zipCode?: string | null;
    streamUrl?: string | null;
    date: string;
    startTime: string;
    endTime: string;
  };
  extras?: {
    catering?: boolean;
    parking?: boolean;
    recording?: boolean;
    promoCode?: string | null;
  };
  tickets?: EventTicketDto[];
  guests?: EventGuestDto[];
}

export function toEventPayloadDto(body: any): EventPayloadDto {
  return body as EventPayloadDto;
}
