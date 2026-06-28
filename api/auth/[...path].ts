import express from 'express';

import { authRouter } from '../../src/server/modules/auth/auth.routes';

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);
app.use('/', authRouter);

export default app;