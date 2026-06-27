import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { bookings } from '../model/booking.schema';
import { events, ticketTiers } from '../../events/model/event.schema';
import { BookingRequestDto } from '../dto/booking-request.dto';
import { BookingError } from '../model/booking.model';

class BookingService {
  async listByUser(userId: string): Promise<unknown[]> {
    return db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: {
        event: {
          columns: {
            id: true,
            title: true,
            date: true,
            format: true,
            category: true,
            status: true,
            venueName: true,
            venueCity: true,
            streamUrl: true,
            startTime: true,
            endTime: true,
            organizer: true,
          },
        },
        ticketTier: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.bookedAt)],
    });
  }

  async create(userId: string, dto: BookingRequestDto): Promise<unknown> {
    return db.transaction(async (tx) => {
      const event = await tx.query.events.findFirst({
        where: eq(events.id, dto.eventId),
      });

      if (!event) {
        throw new BookingError(404, 'Event not found');
      }

      const [tier] = await tx
        .update(ticketTiers)
        .set({ quantity: sql`${ticketTiers.quantity} - ${dto.quantity}` })
        .where(
          and(
            eq(ticketTiers.id, dto.ticketTierId),
            eq(ticketTiers.eventId, dto.eventId),
            gte(ticketTiers.quantity, dto.quantity),
          ),
        )
        .returning();

      if (!tier) {
        const existingTier = await tx.query.ticketTiers.findFirst({
          where: eq(ticketTiers.id, dto.ticketTierId),
        });

        if (!existingTier || existingTier.eventId !== dto.eventId) {
          throw new BookingError(404, 'Ticket tier not found for this event');
        }

        throw new BookingError(409, 'Not enough tickets available');
      }

      const totalPrice = Number(tier.price) * dto.quantity;

      const [booking] = await tx
        .insert(bookings)
        .values({
          userId,
          eventId: dto.eventId,
          ticketTierId: dto.ticketTierId,
          quantity: dto.quantity,
          totalPrice: String(totalPrice),
        })
        .returning();

      return booking;
    });
  }

  async cancel(userId: string, bookingId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const existing = await tx.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
      });

      if (!existing) {
        throw new BookingError(404, 'Booking not found');
      }

      if (existing.userId !== userId) {
        throw new BookingError(403, 'Not authorized to cancel this booking');
      }

      await tx.delete(bookings).where(eq(bookings.id, bookingId));
      await tx
        .update(ticketTiers)
        .set({ quantity: sql`${ticketTiers.quantity} + ${existing.quantity}` })
        .where(eq(ticketTiers.id, existing.ticketTierId));
    });
  }
}

export const bookingService = new BookingService();



