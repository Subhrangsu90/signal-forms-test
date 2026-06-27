import { Request, Response } from 'express';
import { toBookingRequestDto, validateBookingRequestDto } from '../dto/booking-request.dto';
import { BookingError } from '../model/booking.model';
import { bookingService } from '../service/booking.service';

class BookingController {
  listMine = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json(await bookingService.listByUser(req.user!.id));
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch bookings', 'Get my bookings error:');
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const dto = toBookingRequestDto(req.body);
    const validationError = validateBookingRequestDto(dto);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const booking = await bookingService.create(req.user!.id, dto);
      res.status(201).json(booking);
    } catch (err) {
      this.handleError(res, err, 'Failed to create booking', 'Create booking error:');
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      await bookingService.cancel(req.user!.id, req.params['id'] as string);
      res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
      this.handleError(res, err, 'Failed to cancel booking', 'Cancel booking error:');
    }
  };

  private handleError(res: Response, err: unknown, fallbackMessage: string, logPrefix: string): void {
    if (err instanceof BookingError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    console.error(logPrefix, err);
    res.status(500).json({ error: fallbackMessage });
  }
}

export const bookingController = new BookingController();
