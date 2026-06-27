import { SelectOption } from '../../shared/form-controls';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export type EventData = {
  event: {
    title: string;
    organizer: string;
    email: string;
    phone: string;
    category: string;
    format: string;
  };
  venue: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    streamUrl: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  tickets: Array<{
    tierName: string;
    price: number;
    quantity: number;
  }>;
  guests: Array<{
    name: string;
    email: string;
  }>;
  extras: {
    catering: boolean;
    parking: boolean;
    recording: boolean;
    promoCode: string;
  };
  terms: {
    agreeToTerms: boolean;
    newsletter: boolean;
  };
};

export type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  format: 'in-person' | 'virtual' | 'hybrid';
  category: string;
  guests: number;
  revenue: number;
  status: 'upcoming' | 'live' | 'completed';
};

export const categoryOptions: readonly SelectOption[] = [
  { label: 'Conference', value: 'conference' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Concert', value: 'concert' },
  { label: 'Meetup', value: 'meetup' },
];

export const formatOptions: readonly SelectOption[] = [
  { label: 'In-person', value: 'in-person' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Hybrid', value: 'hybrid' },
];

export const suggestedVenues: Record<string, string> = {
  conference: 'Grand Convention Center',
  workshop: 'Creative Lab Studio',
  concert: 'City Amphitheater',
  meetup: 'Downtown Co-working Hub',
};

export const sampleEvents: readonly DashboardEvent[] = [
  {
    id: 'evt-angular',
    title: 'Angular Signals Summit',
    date: '2026-07-15',
    format: 'hybrid',
    category: 'conference',
    guests: 240,
    revenue: 72000,
    status: 'upcoming',
  },
  {
    id: 'evt-design',
    title: 'Design Systems Workshop',
    date: '2026-07-22',
    format: 'in-person',
    category: 'workshop',
    guests: 35,
    revenue: 8750,
    status: 'upcoming',
  },
  {
    id: 'evt-music',
    title: 'Indie Music Night',
    date: '2026-06-28',
    format: 'in-person',
    category: 'concert',
    guests: 180,
    revenue: 14400,
    status: 'live',
  },
  {
    id: 'evt-devs',
    title: 'Frontend Devs Meetup',
    date: '2026-06-20',
    format: 'virtual',
    category: 'meetup',
    guests: 92,
    revenue: 0,
    status: 'completed',
  },
];

export function createEventData(): EventData {
  return {
    event: {
      title: '',
      organizer: '',
      email: '',
      phone: '',
      category: 'conference',
      format: 'in-person',
    },
    venue: {
      name: '',
      address: '',
      city: '',
      zipCode: '',
      streamUrl: '',
      date: '',
      startTime: '',
      endTime: '',
    },
    tickets: [{ tierName: '', price: 0, quantity: 1 }],
    guests: [{ name: '', email: '' }],
    extras: {
      catering: false,
      parking: false,
      recording: false,
      promoCode: '',
    },
    terms: {
      agreeToTerms: false,
      newsletter: true,
    },
  };
}
