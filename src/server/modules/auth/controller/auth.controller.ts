import { Request, Response } from 'express';
import { toLoginDto, validateLoginDto } from '../dto/login.dto';
import { toRegisterDto, validateRegisterDto } from '../dto/register.dto';
import { AuthError } from '../model/auth.model';
import { authService } from '../service/auth.service';

class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const dto = toRegisterDto(req.body);
    const validationError = validateRegisterDto(dto);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const result = await authService.register(dto);
      res.status(201).json(result);
    } catch (err) {
      this.handleError(res, err, 'Registration failed', 'Register error:');
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto = toLoginDto(req.body);
    const validationError = validateLoginDto(dto);

    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const result = await authService.login(dto);
      res.json(result);
    } catch (err) {
      this.handleError(res, err, 'Login failed', 'Login error:');
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ user });
    } catch (err) {
      this.handleError(res, err, 'Failed to fetch profile', 'Get profile error:');
    }
  };

  private handleError(res: Response, err: unknown, fallbackMessage: string, logPrefix: string): void {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    console.error(logPrefix, err);
    res.status(500).json({ error: fallbackMessage });
  }
}

export const authController = new AuthController();
