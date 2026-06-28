import express from 'express';

import { authRouter } from '../src/server/modules/auth/auth.routes';
import { bookingsRouter } from '../src/server/modules/bookings/bookings.routes';
import { eventsRouter } from '../src/server/modules/events/events.routes';

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);

export default app;