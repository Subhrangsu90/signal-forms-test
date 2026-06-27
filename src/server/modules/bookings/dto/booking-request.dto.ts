export interface BookingRequestDto {
  eventId: string;
  ticketTierId: string;
  quantity: number;
}

export function toBookingRequestDto(body: any): BookingRequestDto {
  return {
    eventId: String(body?.eventId ?? ''),
    ticketTierId: String(body?.ticketTierId ?? ''),
    quantity: Number(body?.quantity),
  };
}

export function validateBookingRequestDto(dto: BookingRequestDto): string | null {
  if (!dto.eventId || !dto.ticketTierId || !Number.isInteger(dto.quantity) || dto.quantity < 1) {
    return 'eventId, ticketTierId, and quantity (>= 1) are required';
  }

  return null;
}
