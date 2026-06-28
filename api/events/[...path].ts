import express from 'express';

import { eventsRouter } from '../../src/server/modules/events/events.routes';

const app = express();

app.use(express.json());
app.use('/api/events', eventsRouter);
app.use('/events', eventsRouter);
app.use('/', eventsRouter);

export default app;