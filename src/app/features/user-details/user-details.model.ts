import { SelectOption } from '../../shared/form-controls';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export type UserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  role: string;
  department: string;
  employmentType: string;
  company: string;
  startDate: string;
  experience: Array<{
    company: string;
    role: string;
  }>;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  skills: {
    angular: boolean;
    ngrx: boolean;
    testing: boolean;
  };
  bio: string;
  newsletter: boolean;
};

export const roleOptions: readonly SelectOption[] = [
  { label: 'Developer', value: 'developer' },
  { label: 'Designer', value: 'designer' },
  { label: 'Manager', value: 'manager' },
  { label: 'Analyst', value: 'analyst' },
];

export const departmentOptions: readonly SelectOption[] = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Design', value: 'design' },
  { label: 'Operations', value: 'operations' },
];

export const employmentOptions: readonly SelectOption[] = [
  { label: 'Full time', value: 'full-time' },
  { label: 'Part time', value: 'part-time' },
  { label: 'Contractor', value: 'contractor' },
];

export function createUserDetails(): UserDetails {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: 18,
    role: 'developer',
    department: 'engineering',
    employmentType: 'full-time',
    company: '',
    startDate: '',
    experience: [{ company: '', role: '' }],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    skills: {
      angular: true,
      ngrx: false,
      testing: false,
    },
    bio: '',
    newsletter: true,
  };
}
