export interface LoginDto {
  email: string;
  password: string;
}

export function toLoginDto(body: any): LoginDto {
  return {
    email: String(body?.email ?? '').trim().toLowerCase(),
    password: String(body?.password ?? ''),
  };
}

export function validateLoginDto(dto: LoginDto): string | null {
  if (!dto.email || !dto.password) {
    return 'Email and password are required';
  }

  return null;
}
