import { boolean, date, integer, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '../../auth/model/user.schema';

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 200 }).notNull(),
  organizer: varchar('organizer', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  format: varchar('format', { length: 20 }).notNull(),

  venueName: varchar('venue_name', { length: 200 }),
  venueAddress: varchar('venue_address', { length: 300 }),
  venueCity: varchar('venue_city', { length: 100 }),
  venueZipCode: varchar('venue_zip_code', { length: 20 }),
  streamUrl: varchar('stream_url', { length: 500 }),

  date: date('date').notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),

  catering: boolean('catering').default(false).notNull(),
  parking: boolean('parking').default(false).notNull(),
  recording: boolean('recording').default(false).notNull(),
  promoCode: varchar('promo_code', { length: 50 }),

  status: varchar('status', { length: 20 }).default('upcoming').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ticketTiers = pgTable('ticket_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  tierName: varchar('tier_name', { length: 100 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
});

export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
});
