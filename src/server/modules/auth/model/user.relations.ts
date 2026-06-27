import { relations } from 'drizzle-orm';
import { bookings } from '../../bookings/model/booking.schema';
import { events } from '../../events/model/event.schema';
import { users } from './user.schema';

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  bookings: many(bookings),
}));
