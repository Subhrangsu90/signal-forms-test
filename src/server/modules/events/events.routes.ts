import { Router } from 'express';
import { requireAuth } from '../auth/middleware/auth.middleware';
import { eventController } from './controller/event.controller';

const router = Router();

router.get('/', eventController.listAll);
router.get('/my', requireAuth, eventController.listMine);
router.get('/:id/sales', requireAuth, eventController.getSalesReport);
router.get('/:id', eventController.getById);
router.post('/', requireAuth, eventController.create);
router.put('/:id', requireAuth, eventController.update);
router.delete('/:id', requireAuth, eventController.delete);
router.patch('/:id/status', requireAuth, eventController.updateStatus);

export const eventsRouter = router;


