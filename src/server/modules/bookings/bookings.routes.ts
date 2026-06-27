import { Router } from 'express';
import { requireAuth } from '../auth/middleware/auth.middleware';
import { bookingController } from './controller/booking.controller';

const router = Router();

router.get('/my', requireAuth, bookingController.listMine);
router.post('/', requireAuth, bookingController.create);
router.delete('/:id', requireAuth, bookingController.cancel);

export const bookingsRouter = router;

