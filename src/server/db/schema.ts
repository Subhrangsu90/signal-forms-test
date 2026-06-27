import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  bookings: many(bookings),
}));

// ──────────────────────────────────────────────
// Events
// ──────────────────────────────────────────────
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Event basics
  title: varchar('title', { length: 200 }).notNull(),
  organizer: varchar('organizer', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  format: varchar('format', { length: 20 }).notNull(),

  // Venue
  venueName: varchar('venue_name', { length: 200 }),
  venueAddress: varchar('venue_address', { length: 300 }),
  venueCity: varchar('venue_city', { length: 100 }),
  venueZipCode: varchar('venue_zip_code', { length: 20 }),
  streamUrl: varchar('stream_url', { length: 500 }),

  // Schedule
  date: date('date').notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),

  // Extras
  catering: boolean('catering').default(false).notNull(),
  parking: boolean('parking').default(false).notNull(),
  recording: boolean('recording').default(false).notNull(),
  promoCode: varchar('promo_code', { length: 50 }),

  // Status
  status: varchar('status', { length: 20 }).default('upcoming').notNull(),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  ticketTiers: many(ticketTiers),
  guests: many(guests),
  bookings: many(bookings),
}));

// ──────────────────────────────────────────────
// Ticket Tiers
// ──────────────────────────────────────────────
export const ticketTiers = pgTable('ticket_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  tierName: varchar('tier_name', { length: 100 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
});

export const ticketTiersRelations = relations(ticketTiers, ({ one }) => ({
  event: one(events, { fields: [ticketTiers.eventId], references: [events.id] }),
}));

// ──────────────────────────────────────────────
// Guests
// ──────────────────────────────────────────────
export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
});

export const guestsRelations = relations(guests, ({ one }) => ({
  event: one(events, { fields: [guests.eventId], references: [events.id] }),
}));

// ──────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────
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

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  event: one(events, { fields: [bookings.eventId], references: [events.id] }),
  ticketTier: one(ticketTiers, { fields: [bookings.ticketTierId], references: [ticketTiers.id] }),
}));
