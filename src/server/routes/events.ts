import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { events, ticketTiers, guests } from '../db/schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/events
 * Public — list all events with aggregated ticket/guest data.
 */
router.get('/', async (_req, res) => {
  try {
    const allEvents = await db.query.events.findMany({
      with: {
        ticketTiers: true,
        guests: true,
      },
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    const result = allEvents.map((event) => ({
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
      revenue: event.ticketTiers.reduce(
        (sum, t) => sum + Number(t.price) * t.quantity,
        0,
      ),
      createdAt: event.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/events/my
 * Auth — list events created by the logged-in user.
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const myEvents = await db.query.events.findMany({
      where: eq(events.userId, req.user!.id),
      with: {
        ticketTiers: true,
        guests: true,
      },
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    const result = myEvents.map((event) => ({
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
      revenue: event.ticketTiers.reduce(
        (sum, t) => sum + Number(t.price) * t.quantity,
        0,
      ),
      createdAt: event.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('List my events error:', err);
    res.status(500).json({ error: 'Failed to fetch your events' });
  }
});

/**
 * GET /api/events/:id
 * Public — get a single event with full details.
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, req.params['id'] as string),
      with: {
        ticketTiers: true,
        guests: true,
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * POST /api/events
 * Auth — create a new event with ticket tiers and guests.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const body = req.body;

    // Insert the event
    const [newEvent] = await db
      .insert(events)
      .values({
        userId: req.user!.id,
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

    // Insert ticket tiers
    if (body.tickets?.length) {
      await db.insert(ticketTiers).values(
        body.tickets.map((t: any) => ({
          eventId: newEvent.id,
          tierName: t.tierName,
          price: String(t.price),
          quantity: t.quantity,
        })),
      );
    }

    // Insert guests
    if (body.guests?.length) {
      const validGuests = body.guests.filter(
        (g: any) => g.name?.trim() && g.email?.trim(),
      );
      if (validGuests.length) {
        await db.insert(guests).values(
          validGuests.map((g: any) => ({
            eventId: newEvent.id,
            name: g.name,
            email: g.email,
          })),
        );
      }
    }

    // Fetch the complete event with relations
    const complete = await db.query.events.findFirst({
      where: eq(events.id, newEvent.id),
      with: {
        ticketTiers: true,
        guests: true,
      },
    });

    res.status(201).json(complete);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Auth — update an event owned by the logged-in user.
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params['id'] as string;
    const body = req.body;

    // Verify ownership
    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to update this event' });
      return;
    }

    // Update the event
    await db
      .update(events)
      .set({
        title: body.event?.title ?? existing.title,
        organizer: body.event?.organizer ?? existing.organizer,
        email: body.event?.email ?? existing.email,
        phone: body.event?.phone ?? existing.phone,
        category: body.event?.category ?? existing.category,
        format: body.event?.format ?? existing.format,
        venueName: body.venue?.name,
        venueAddress: body.venue?.address,
        venueCity: body.venue?.city,
        venueZipCode: body.venue?.zipCode,
        streamUrl: body.venue?.streamUrl,
        date: body.venue?.date ?? existing.date,
        startTime: body.venue?.startTime ?? existing.startTime,
        endTime: body.venue?.endTime ?? existing.endTime,
        catering: body.extras?.catering ?? existing.catering,
        parking: body.extras?.parking ?? existing.parking,
        recording: body.extras?.recording ?? existing.recording,
        promoCode: body.extras?.promoCode,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

    // Replace ticket tiers
    if (body.tickets) {
      await db.delete(ticketTiers).where(eq(ticketTiers.eventId, eventId));
      if (body.tickets.length) {
        await db.insert(ticketTiers).values(
          body.tickets.map((t: any) => ({
            eventId,
            tierName: t.tierName,
            price: String(t.price),
            quantity: t.quantity,
          })),
        );
      }
    }

    // Replace guests
    if (body.guests) {
      await db.delete(guests).where(eq(guests.eventId, eventId));
      const validGuests = body.guests.filter(
        (g: any) => g.name?.trim() && g.email?.trim(),
      );
      if (validGuests.length) {
        await db.insert(guests).values(
          validGuests.map((g: any) => ({
            eventId,
            name: g.name,
            email: g.email,
          })),
        );
      }
    }

    const updated = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: { ticketTiers: true, guests: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Auth — delete an event owned by the logged-in user.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params['id'] as string;

    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this event' });
      return;
    }

    await db.delete(events).where(eq(events.id, eventId));
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

/**
 * PATCH /api/events/:id/status
 * Auth — update event status.
 */
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const eventId = req.params['id'] as string;
    const { status } = req.body;

    if (!['upcoming', 'live', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be upcoming, live, or completed' });
      return;
    }

    const existing = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to update this event' });
      return;
    }

    const [updated] = await db
      .update(events)
      .set({ status, updatedAt: new Date() })
      .where(eq(events.id, eventId))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update event status' });
  }
});

export const eventsRouter = router;
