import { Request, Response } from 'express';
import { toEventPayloadDto } from '../dto/event-payload.dto';
import { toUpdateEventStatusDto, validateUpdateEventStatusDto } from '../dto/update-event-status.dto';
import { EventError } from '../model/event.model';
import { eventService } from '../service/event.service';

class EventController {
  listAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.json(await eventService.listAll());
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch events', 'List events error:');
    }
  };

  listMine = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json(await eventService.listByOwner(req.user!.id));
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch your events', 'List my events error:');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json(await eventService.getById(req.params['id'] as string));
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch event', 'Get event error:');
    }
  };

  getSalesReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = await eventService.getSalesReport(req.params['id'] as string, req.user!.id);
      res.json(report);
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch event sales', 'Get event sales error:');
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await eventService.create(req.user!.id, toEventPayloadDto(req.body));
      res.status(201).json(event);
    } catch (err) {
      this.handleError(res, err, 'Failed to create event', 'Create event error:');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await eventService.update(
        req.params['id'] as string,
        req.user!.id,
        toEventPayloadDto(req.body),
      );
      res.json(event);
    } catch (err) {
      this.handleError(res, err, 'Failed to update event', 'Update event error:');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await eventService.delete(req.params['id'] as string, req.user!.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      this.handleError(res, err, 'Failed to delete event', 'Delete event error:');
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const dto = toUpdateEventStatusDto(req.body);
    const validationError = validateUpdateEventStatusDto(dto);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const event = await eventService.updateStatus(req.params['id'] as string, req.user!.id, dto.status);
      res.json(event);
    } catch (err) {
      this.handleError(res, err, 'Failed to update event status', 'Update status error:');
    }
  };

  private handleError(res: Response, err: unknown, fallbackMessage: string, logPrefix: string): void {
    if (err instanceof EventError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    console.error(logPrefix, err);
    res.status(500).json({ error: fallbackMessage });
  }
}

export const eventController = new EventController();

