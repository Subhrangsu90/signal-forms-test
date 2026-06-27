import { SelectOption } from '../../shared/form-controls';

export type IntakeStatus = 'idle' | 'saving' | 'saved';

export type IntakeLead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  projectType: string;
  timeline: string;
  budget: string;
  value: number;
  status: 'New' | 'Qualified' | 'Proposal' | 'Scheduled';
  nextStep: string;
  due: string;
  health: 'Hot' | 'Warm' | 'Watch';
};

export type IntakeTask = {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
};

export type ClientIntake = {
  client: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  project: {
    type: string;
    budget: string;
    timeline: string;
    launchDate: string;
    summary: string;
  };
  services: {
    strategy: boolean;
    design: boolean;
    development: boolean;
    support: boolean;
  };
  milestones: Array<{
    name: string;
    owner: string;
  }>;
  consent: {
    nda: boolean;
    updates: boolean;
  };
};

export const projectTypeOptions: readonly SelectOption[] = [
  { label: 'Website redesign', value: 'website' },
  { label: 'Product launch', value: 'product' },
  { label: 'Brand system', value: 'brand' },
  { label: 'Automation project', value: 'automation' },
];

export const timelineOptions: readonly SelectOption[] = [
  { label: 'ASAP', value: 'asap' },
  { label: '1-2 months', value: '1-2-months' },
  { label: '3-6 months', value: '3-6-months' },
  { label: 'Flexible', value: 'flexible' },
];

export const budgetSuggestions: Record<string, string> = {
  website: '$15k - $30k',
  product: '$30k - $75k',
  brand: '$10k - $25k',
  automation: '$20k - $60k',
};

export const intakeLeads: readonly IntakeLead[] = [
  {
    id: 'lead-nova',
    company: 'NovaGrid Labs',
    contact: 'Maya Chen',
    email: 'maya@novagrid.test',
    phone: '+1 415 555 0138',
    projectType: 'product',
    timeline: '1-2-months',
    budget: '$30k - $75k',
    value: 64000,
    status: 'Qualified',
    nextStep: 'Scope workshop',
    due: 'Today',
    health: 'Hot',
  },
  {
    id: 'lead-civic',
    company: 'Civic Bloom',
    contact: 'Rafael Ortiz',
    email: 'rafael@civicbloom.test',
    phone: '+1 212 555 0184',
    projectType: 'website',
    timeline: '3-6-months',
    budget: '$15k - $30k',
    value: 28000,
    status: 'New',
    nextStep: 'Review brief',
    due: 'Tomorrow',
    health: 'Warm',
  },
  {
    id: 'lead-summit',
    company: 'Summit & Co.',
    contact: 'Priya Shah',
    email: 'priya@summitco.test',
    phone: '+1 646 555 0119',
    projectType: 'automation',
    timeline: 'flexible',
    budget: '',
    value: 42000,
    status: 'Proposal',
    nextStep: 'Send estimate',
    due: 'Friday',
    health: 'Watch',
  },
];

export const intakeTasks: readonly IntakeTask[] = [
  {
    id: 'task-brief',
    title: 'Attach discovery brief',
    owner: 'Ops',
    due: 'Today',
    priority: 'High',
  },
  {
    id: 'task-calendar',
    title: 'Book kickoff window',
    owner: 'Sales',
    due: 'Tomorrow',
    priority: 'Medium',
  },
  {
    id: 'task-nda',
    title: 'Confirm NDA preference',
    owner: 'Legal',
    due: 'This week',
    priority: 'Low',
  },
];

export function createClientIntake(): ClientIntake {
  return {
    client: {
      name: '',
      email: '',
      company: '',
      phone: '',
    },
    project: {
      type: 'website',
      budget: '',
      timeline: '1-2-months',
      launchDate: '',
      summary: '',
    },
    services: {
      strategy: true,
      design: false,
      development: true,
      support: false,
    },
    milestones: [{ name: '', owner: '' }],
    consent: {
      nda: false,
      updates: true,
    },
  };
}
