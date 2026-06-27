import { relations } from 'drizzle-orm';
import { users } from '../../auth/model/user.schema';
import { bookings } from '../../bookings/model/booking.schema';
import { events, guests, ticketTiers } from './event.schema';

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  ticketTiers: many(ticketTiers),
  guests: many(guests),
  bookings: many(bookings),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one }) => ({
  event: one(events, { fields: [ticketTiers.eventId], references: [events.id] }),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  event: one(events, { fields: [guests.eventId], references: [events.id] }),
}));
