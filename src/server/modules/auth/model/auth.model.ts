export interface AuthPayload {
  id: string;
  email: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthProfile extends AuthUser {
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class AuthError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
