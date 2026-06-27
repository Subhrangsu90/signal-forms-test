import { EventStatus } from '../model/event.model';

const allowedStatuses: EventStatus[] = ['upcoming', 'live', 'completed'];

export interface UpdateEventStatusDto {
  status: EventStatus;
}

export function toUpdateEventStatusDto(body: any): UpdateEventStatusDto {
  return {
    status: body?.status,
  };
}

export function validateUpdateEventStatusDto(dto: UpdateEventStatusDto): string | null {
  if (!allowedStatuses.includes(dto.status)) {
    return 'Invalid status. Must be upcoming, live, or completed';
  }

  return null;
}
