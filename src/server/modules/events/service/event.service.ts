import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { events, guests, ticketTiers } from '../model/event.schema';
import { EventPayloadDto } from '../dto/event-payload.dto';
import { EventError, EventListItem, EventSalesReport, EventStatus } from '../model/event.model';

class EventService {
  async listAll(): Promise<EventListItem[]> {
    const allEvents = await db.query.events.findMany({
      with: {
        ticketTiers: true,
        guests: true,
        bookings: true,
      },
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    return allEvents.map((event) => this.toListItem(event));
  }

  async listByOwner(userId: string): Promise<EventListItem[]> {
    const myEvents = await db.query.events.findMany({
      where: eq(events.userId, userId),
      with: {
        ticketTiers: true,
        guests: true,
        bookings: true,
      },
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    return myEvents.map((event) => this.toListItem(event));
  }

  async getById(eventId: string): Promise<unknown> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        ticketTiers: true,
        guests: true,
      },
    });

    if (!event) {
      throw new EventError(404, 'Event not found');
    }

    return event;
  }

  async getSalesReport(eventId: string, userId: string): Promise<EventSalesReport> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        ticketTiers: true,
        bookings: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            ticketTier: true,
          },
          orderBy: (bookings, { desc }) => [desc(bookings.bookedAt)],
        },
      },
    });

    this.assertOwner(event, userId, 'view sales for');

    const bookings = event!.bookings;
    const tickets = event!.ticketTiers.map((tier) => {
      const tierBookings = bookings.filter((booking) => booking.ticketTierId === tier.id);
      const sold = tierBookings.reduce((sum, booking) => sum + booking.quantity, 0);
      const revenue = tierBookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0);

      return {
        id: tier.id,
        tierName: tier.tierName,
        price: tier.price,
        left: tier.quantity,
        sold,
        revenue,
      };
    });

    return {
      event: {
        id: event!.id,
        title: event!.title,
        date: event!.date,
        status: event!.status,
      },
      totals: {
        ticketsLeft: tickets.reduce((sum, ticket) => sum + ticket.left, 0),
        ticketsSold: bookings.reduce((sum, booking) => sum + booking.quantity, 0),
        revenue: bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0),
        buyers: new Set(bookings.map((booking) => booking.userId)).size,
      },
      tickets,
      buyers: bookings.map((booking) => ({
        bookingId: booking.id,
        userId: booking.userId,
        name: booking.user.name,
        email: booking.user.email,
        ticketTier: booking.ticketTier.tierName,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        bookedAt: booking.bookedAt,
      })),
    };
  }

  async create(userId: string, body: EventPayloadDto): Promise<unknown> {
    return db.transaction(async (tx) => {
      const [newEvent] = await tx
        .insert(events)
        .values({
          userId,
          title: body.event.title,
          organizer: body.event.organizer,
          email: body.event.email,
          phone: body.event.phone,
          category: body.event.category,
          format: body.event.format,
          venueName: body.venue?.name || null,
          venueAddress: body.venue?.address || null,
          venueCity: body.venue?.city || null,
          venueZipCode: body.venue?.zipCode || null,
          streamUrl: body.venue?.streamUrl || null,
          date: body.venue.date,
          startTime: body.venue.startTime,
          endTime: body.venue.endTime,
          catering: body.extras?.catering ?? false,
          parking: body.extras?.parking ?? false,
          recording: body.extras?.recording ?? false,
          promoCode: body.extras?.promoCode || null,
          status: 'upcoming',
        })
        .returning();

      if (body.tickets?.length) {
        await tx.insert(ticketTiers).values(
          body.tickets.map((ticket) => ({
            eventId: newEvent.id,
            tierName: ticket.tierName,
            price: String(ticket.price),
            quantity: ticket.quantity,
          })),
        );
      }

      if (body.guests?.length) {
        const validGuests = body.guests.filter(
          (guest) => guest.name?.trim() && guest.email?.trim(),
        );
        if (validGuests.length) {
          await tx.insert(guests).values(
            validGuests.map((guest) => ({
              eventId: newEvent.id,
              name: guest.name,
              email: guest.email,
            })),
          );
        }
      }

      return tx.query.events.findFirst({
        where: eq(events.id, newEvent.id),
        with: {
          ticketTiers: true,
          guests: true,
        },
      });
    });
  }

  async update(eventId: string, userId: string, body: Partial<EventPayloadDto>): Promise<unknown> {
    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    this.assertOwner(existing, userId, 'update');

    await db
      .update(events)
      .set({
        title: body.event?.title ?? existing!.title,
        organizer: body.event?.organizer ?? existing!.organizer,
        email: body.event?.email ?? existing!.email,
        phone: body.event?.phone ?? existing!.phone,
        category: body.event?.category ?? existing!.category,
        format: body.event?.format ?? existing!.format,
        venueName: body.venue?.name,
        venueAddress: body.venue?.address,
        venueCity: body.venue?.city,
        venueZipCode: body.venue?.zipCode,
        streamUrl: body.venue?.streamUrl,
        date: body.venue?.date ?? existing!.date,
        startTime: body.venue?.startTime ?? existing!.startTime,
        endTime: body.venue?.endTime ?? existing!.endTime,
        catering: body.extras?.catering ?? existing!.catering,
        parking: body.extras?.parking ?? existing!.parking,
        recording: body.extras?.recording ?? existing!.recording,
        promoCode: body.extras?.promoCode,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

    if (body.tickets) {
      await db.delete(ticketTiers).where(eq(ticketTiers.eventId, eventId));
      if (body.tickets.length) {
        await db.insert(ticketTiers).values(
          body.tickets.map((ticket) => ({
            eventId,
            tierName: ticket.tierName,
            price: String(ticket.price),
            quantity: ticket.quantity,
          })),
        );
      }
    }

    if (body.guests) {
      await db.delete(guests).where(eq(guests.eventId, eventId));
      const validGuests = body.guests.filter(
        (guest) => guest.name?.trim() && guest.email?.trim(),
      );
      if (validGuests.length) {
        await db.insert(guests).values(
          validGuests.map((guest) => ({
            eventId,
            name: guest.name,
            email: guest.email,
          })),
        );
      }
    }

    return db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: { ticketTiers: true, guests: true },
    });
  }

  async delete(eventId: string, userId: string): Promise<void> {
    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    this.assertOwner(existing, userId, 'delete');
    await db.delete(events).where(eq(events.id, eventId));
  }

  async updateStatus(eventId: string, userId: string, status: EventStatus): Promise<unknown> {
    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    this.assertOwner(existing, userId, 'update');

    const [updated] = await db
      .update(events)
      .set({ status, updatedAt: new Date() })
      .where(eq(events.id, eventId))
      .returning();

    return updated;
  }

  private assertOwner(existing: typeof events.$inferSelect | undefined, userId: string, action: string): void {
    if (!existing) {
      throw new EventError(404, 'Event not found');
    }

    if (existing.userId !== userId) {
      throw new EventError(403, `Not authorized to ${action} this event`);
    }
  }

  private toListItem(event: any): EventListItem {
    const ticketsLeft = event.ticketTiers.reduce(
      (sum: number, ticket: any) => sum + ticket.quantity,
      0,
    );
    const ticketsSold = (event.bookings ?? []).reduce(
      (sum: number, booking: any) => sum + booking.quantity,
      0,
    );
    const revenue = (event.bookings ?? []).reduce(
      (sum: number, booking: any) => sum + Number(booking.totalPrice),
      0,
    );

    return {
      id: event.id,
      title: event.title,
      organizer: event.organizer,
      date: event.date,
      format: event.format,
      category: event.category,
      status: event.status,
      venueName: event.venueName,
      venueCity: event.venueCity,
      streamUrl: event.streamUrl,
      startTime: event.startTime,
      endTime: event.endTime,
      guests: event.guests.length,
      ticketTiers: event.ticketTiers,
      ticketsLeft,
      ticketsSold,
      revenue,
      createdAt: event.createdAt,
    };
  }
}

export const eventService = new EventService();
