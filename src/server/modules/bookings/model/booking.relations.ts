import { relations } from 'drizzle-orm';
import { users } from '../../auth/model/user.schema';
import { events, ticketTiers } from '../../events/model/event.schema';
import { bookings } from './booking.schema';

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  event: one(events, { fields: [bookings.eventId], references: [events.id] }),
  ticketTier: one(ticketTiers, { fields: [bookings.ticketTierId], references: [ticketTiers.id] }),
}));
