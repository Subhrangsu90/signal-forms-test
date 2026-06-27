import { integer, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../../auth/model/user.schema';
import { events, ticketTiers } from '../../events/model/event.schema';

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  ticketTierId: uuid('ticket_tier_id')
    .notNull()
    .references(() => ticketTiers.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  bookedAt: timestamp('booked_at', { withTimezone: true }).defaultNow().notNull(),
});
