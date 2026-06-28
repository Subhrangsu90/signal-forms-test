import express from 'express';

import { bookingsRouter } from '../../src/server/modules/bookings/bookings.routes';

const app = express();

app.use(express.json());
app.use('/api/bookings', bookingsRouter);
app.use('/bookings', bookingsRouter);
app.use('/', bookingsRouter);

export default app;