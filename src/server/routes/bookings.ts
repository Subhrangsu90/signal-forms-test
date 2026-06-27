import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { bookings, events, ticketTiers } from '../db/schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/bookings/my
 * Auth — get current user's bookings with event and ticket tier details.
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const myBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, req.user!.id),
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

    res.json(myBookings);
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * POST /api/bookings
 * Auth — book tickets for an event.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { eventId, ticketTierId, quantity } = req.body;

    if (!eventId || !ticketTierId || !quantity || quantity < 1) {
      res.status(400).json({ error: 'eventId, ticketTierId, and quantity (>= 1) are required' });
      return;
    }

    // Verify the event exists
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Verify the ticket tier exists and belongs to this event
    const tier = await db.query.ticketTiers.findFirst({
      where: eq(ticketTiers.id, ticketTierId),
    });

    if (!tier || tier.eventId !== eventId) {
      res.status(404).json({ error: 'Ticket tier not found for this event' });
      return;
    }

    const totalPrice = Number(tier.price) * quantity;

    const [booking] = await db
      .insert(bookings)
      .values({
        userId: req.user!.id,
        eventId,
        ticketTierId,
        quantity,
        totalPrice: String(totalPrice),
      })
      .returning();

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * DELETE /api/bookings/:id
 * Auth — cancel a booking owned by the logged-in user.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const bookingId = req.params['id'] as string;

    const existing = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    await db.delete(bookings).where(eq(bookings.id, bookingId));
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export const bookingsRouter = router;
