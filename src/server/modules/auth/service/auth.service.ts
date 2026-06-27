import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../db';
import { users } from '../model/user.schema';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthError, AuthProfile, AuthResponse } from '../model/auth.model';
import { signToken } from '../middleware/auth.middleware';

class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new AuthError(409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    const token = signToken({ id: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new AuthError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new AuthError(401, 'Invalid email or password');
    }

    const token = signToken({ id: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async getProfile(userId: string): Promise<AuthProfile> {
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AuthError(404, 'User not found');
    }

    return user;
  }
}

export const authService = new AuthService();



