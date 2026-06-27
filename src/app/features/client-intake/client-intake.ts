import { ChangeDetectionStrategy, Component, computed, linkedSignal, resource, signal } from '@angular/core';
import {
  applyEach,
  debounce,
  email,
  form,
  hidden,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { environment } from '../../../environments/environment';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '../../shared/form-controls';
import {
  budgetSuggestions,
  ClientIntake as ClientIntakeModel,
  createClientIntake,
  intakeLeads,
  intakeTasks,
  IntakeStatus,
  projectTypeOptions,
  timelineOptions,
} from './client-intake.model';

@Component({
  selector: 'app-client-intake',
  imports: [FormCheckbox, FormInput, FormSelect, FormTextarea],
  templateUrl: './client-intake.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientIntake {
  protected readonly appName = environment.appName;
  protected readonly leadTimeDays = environment.intakeLeadTimeDays;
  protected readonly projectTypeOptions = projectTypeOptions;
  protected readonly timelineOptions = timelineOptions;

  protected readonly leads = signal(intakeLeads);
  protected readonly tasks = signal(intakeTasks);
  protected readonly intakeModel = signal<ClientIntakeModel>(createClientIntake());
  protected readonly submittedIntake = signal<ClientIntakeModel | undefined>(undefined);
  protected readonly saveStatus = signal<IntakeStatus>('idle');

  protected readonly selectedLeadId = linkedSignal(() => this.leads()[0]?.id ?? '');
  protected readonly selectedLead = computed(() => {
    const selectedId = this.selectedLeadId();
    return this.leads().find((lead) => lead.id === selectedId) ?? this.leads()[0];
  });

  private readonly projectType = computed(() => this.intakeModel().project.type);
  protected readonly suggestedBudget = linkedSignal(() => budgetSuggestions[this.projectType()]);

  protected readonly intakeForm = form(this.intakeModel, (path) => {
    debounce(path.client.email, 300);
    debounce(path.client.phone, 250);

    required(path.client.name, { message: 'Client name is required' });
    minLength(path.client.name, 2, { message: 'Use at least 2 characters' });

    required(path.client.email, { message: 'Email is required' });
    email(path.client.email, { message: 'Enter a valid email address' });
    validateAsync(path.client.email, {
      params: ({ value }) => value(),
      factory: (emailValue) =>
        resource({
          params: emailValue,
          loader: async ({ params }) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return environment.reservedClientEmails.includes(params.trim().toLowerCase());
          },
        }),
      onSuccess: (isReserved) =>
        isReserved ? { kind: 'reservedEmail', message: 'This email is already in the intake queue' } : undefined,
      onError: () => ({ kind: 'emailCheckFailed', message: 'Email check failed' }),
    });

    required(path.client.company, { message: 'Company is required' });
    required(path.client.phone, { message: 'Phone number is required' });
    pattern(path.client.phone, /^\+?[0-9\s-]{7,15}$/, {
      message: 'Use 7 to 15 digits, spaces, hyphens, or a leading +',
    });

    required(path.project.budget, { message: 'Budget range is required' });
    hidden(path.project.budget, ({ valueOf }) => valueOf(path.project.timeline) === 'flexible');

    required(path.project.launchDate, { message: 'Target launch date is required' });
    validate(path.project.launchDate, ({ value }) => {
      const rawDate = value();
      if (!rawDate) {
        return undefined;
      }

      const launchDate = new Date(rawDate);
      if (Number.isNaN(launchDate.getTime())) {
        return { kind: 'invalidDate', message: 'Enter a valid launch date' };
      }

      const earliestDate = new Date();
      earliestDate.setHours(0, 0, 0, 0);
      earliestDate.setDate(earliestDate.getDate() + this.leadTimeDays);

      if (launchDate < earliestDate) {
        return {
          kind: 'leadTime',
          message: `Launch date needs at least ${this.leadTimeDays} days of lead time`,
        };
      }

      return undefined;
    });

    required(path.project.summary, { message: 'Project summary is required' });
    minLength(path.project.summary, 20, { message: 'Use at least 20 characters' });
    maxLength(path.project.summary, 500, { message: 'Keep summary under 500 characters' });

    applyEach(path.milestones, (milestone) => {
      required(milestone.name, { message: 'Milestone name is required' });
      required(milestone.owner, { message: 'Milestone owner is required' });
    });

    required(path.consent.nda, { message: 'Confirm NDA preference before submitting' });
  });

  protected readonly formErrors = computed(() => this.intakeForm().errorSummary());

  protected readonly completionPercent = computed(() => {
    const intake = this.intakeModel();
    const values = [
      intake.client.name,
      intake.client.email,
      intake.client.company,
      intake.client.phone,
      intake.project.type,
      intake.project.timeline,
      intake.project.budget || (intake.project.timeline === 'flexible' ? 'flexible' : ''),
      intake.project.launchDate,
      intake.project.summary,
      ...intake.milestones.flatMap((milestone) => [milestone.name, milestone.owner]),
    ];
    const completed = values.filter((value) => value.trim().length > 0).length;
    return Math.round((completed / values.length) * 100);
  });

  protected readonly selectedServices = computed(() => {
    const services = this.intakeModel().services;
    return [
      services.strategy ? 'Strategy' : '',
      services.design ? 'Design' : '',
      services.development ? 'Development' : '',
      services.support ? 'Support' : '',
    ].filter(Boolean);
  });

  protected readonly submittedJson = computed(() => {
    const intake = this.submittedIntake();
    return intake ? JSON.stringify(intake, null, 2) : '';
  });

  protected readonly dashboardMetrics = computed(() => {
    const leads = this.leads();
    const pipelineValue = leads.reduce((total, lead) => total + lead.value, 0);
    const hotLeads = leads.filter((lead) => lead.health === 'Hot').length;
    const proposals = leads.filter((lead) => lead.status === 'Proposal').length;

    return [
      { label: 'Open leads', value: String(leads.length), detail: `${hotLeads} hot` },
      { label: 'Pipeline', value: this.formatCurrency(pipelineValue), detail: 'Weighted intake value' },
      { label: 'Proposals', value: String(proposals), detail: 'Ready for estimate' },
      { label: 'Lead time', value: `${this.leadTimeDays}d`, detail: 'Minimum launch buffer' },
    ];
  });

  protected selectLead(leadId: string): void {
    this.selectedLeadId.set(leadId);
  }

  protected loadSelectedLead(): void {
    const lead = this.selectedLead();
    if (!lead) {
      return;
    }

    this.intakeModel.update((intake) => ({
      ...intake,
      client: {
        ...intake.client,
        name: lead.contact,
        email: lead.email,
        company: lead.company,
        phone: lead.phone,
      },
      project: {
        ...intake.project,
        type: lead.projectType,
        timeline: lead.timeline,
        budget: lead.budget,
      },
    }));
    this.saveStatus.set('idle');
  }

  protected useSuggestedBudget(): void {
    this.intakeModel.update((intake) => ({
      ...intake,
      project: {
        ...intake.project,
        budget: this.suggestedBudget(),
      },
    }));
  }

  protected addMilestone(): void {
    this.intakeModel.update((intake) => ({
      ...intake,
      milestones: [...intake.milestones, { name: '', owner: '' }],
    }));
  }

  protected removeMilestone(index: number): void {
    this.intakeModel.update((intake) => ({
      ...intake,
      milestones: intake.milestones.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  protected resetForm(): void {
    this.intakeModel.set(createClientIntake());
    this.intakeForm().reset();
    this.submittedIntake.set(undefined);
    this.saveStatus.set('idle');
  }

  protected onSubmit(): void {
    submit(this.intakeForm, async () => {
      this.saveStatus.set('saving');
      await new Promise((resolve) => setTimeout(resolve, 350));
      this.submittedIntake.set(this.intakeModel());
      this.saveStatus.set('saved');
    });
  }

  private formatCurrency(value: number): string {
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }

    return `$${value}`;
  }
}
