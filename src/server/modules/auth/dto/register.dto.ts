export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export function toRegisterDto(body: any): RegisterDto {
  return {
    name: String(body?.name ?? '').trim(),
    email: String(body?.email ?? '').trim().toLowerCase(),
    password: String(body?.password ?? ''),
  };
}

export function validateRegisterDto(dto: RegisterDto): string | null {
  if (!dto.name || !dto.email || !dto.password) {
    return 'Name, email, and password are required';
  }

  if (dto.password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
}
