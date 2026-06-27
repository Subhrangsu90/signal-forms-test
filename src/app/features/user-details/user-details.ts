import { ChangeDetectionStrategy, Component, computed, resource, signal } from '@angular/core';
import {
  applyEach,
  debounce,
  email,
  form,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  submit,
  validate,
  validateAsync,
} from '@angular/forms/signals';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '../../shared/form-controls';
import {
  createUserDetails,
  departmentOptions,
  employmentOptions,
  roleOptions,
  SaveStatus,
  UserDetails as UserDetailsModel,
} from './user-details.model';

@Component({
  selector: 'app-user-details',
  imports: [FormCheckbox, FormInput, FormSelect, FormTextarea],
  templateUrl: './user-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetails {
  protected readonly userModel = signal<UserDetailsModel>(createUserDetails());

  protected readonly submittedUser = signal<UserDetailsModel | undefined>(undefined);
  protected readonly saveStatus = signal<SaveStatus>('idle');

  protected readonly roleOptions = roleOptions;
  protected readonly departmentOptions = departmentOptions;
  protected readonly employmentOptions = employmentOptions;

  protected readonly userForm = form(this.userModel, (path) => {
    debounce(path.email, 250);
    debounce(path.phone, 250);

    required(path.firstName, { message: 'First name is required' });
    minLength(path.firstName, 2, { message: 'Use at least 2 characters' });

    required(path.lastName, { message: 'Last name is required' });
    minLength(path.lastName, 2, { message: 'Use at least 2 characters' });

    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email address' });
    validateAsync(path.email, {
      params: ({ value }) => value(),
      factory: (emailValue) =>
        resource({
          params: emailValue,
          loader: async ({ params }) => {
            await new Promise((resolve) => setTimeout(resolve, 350));
            return params.trim().toLowerCase() === 'taken@example.com';
          },
        }),
      onSuccess: (isTaken) =>
        isTaken ? { kind: 'emailTaken', message: 'This email is already registered' } : undefined,
      onError: () => ({ kind: 'emailCheckFailed', message: 'Email availability check failed' }),
    });

    required(path.phone, { message: 'Phone number is required' });
    pattern(path.phone, /^\+?[0-9\s-]{7,15}$/, {
      message: 'Use 7 to 15 digits, spaces, hyphens, or a leading +',
    });

    min(path.age, 18, { message: 'User must be 18 or older' });
    max(path.age, 100, { message: 'Use an age below 101' });

    required(path.company, {
      message: 'Company is required for employees',
      when: ({ valueOf }) => valueOf(path.employmentType) !== 'contractor',
    });
    hidden(path.company, ({ valueOf }) => valueOf(path.employmentType) === 'contractor');

    required(path.startDate, { message: 'Start date is required' });
    validate(path.startDate, ({ value }) => {
      const dateValue = value();
      if (!dateValue) {
        return undefined;
      }

      const date = new Date(dateValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(date.getTime())) {
        return { kind: 'invalidDate', message: 'Enter a valid start date' };
      }

      if (date > today) {
        return { kind: 'futureDate', message: 'Start date cannot be in the future' };
      }

      return undefined;
    });

    applyEach(path.experience, (experience) => {
      required(experience.company, { message: 'Experience company is required' });
      required(experience.role, { message: 'Experience role is required' });
    });

    required(path.address.street, { message: 'Street address is required' });
    maxLength(path.address.street, 80, { message: 'Keep street under 80 characters' });
    required(path.address.city, { message: 'City is required' });
    required(path.address.state, { message: 'State is required' });
    required(path.address.zipCode, { message: 'ZIP code is required' });
    pattern(path.address.zipCode, /^[0-9]{5}(-[0-9]{4})?$/, {
      message: 'Use 12345 or 12345-6789',
    });

    maxLength(path.bio, 180, { message: 'Keep bio under 180 characters' });
  });

  protected readonly formErrors = computed(() => this.userForm().errorSummary());

  protected readonly fullName = computed(() => {
    const user = this.userModel();
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'New user';
  });

  protected readonly submittedJson = computed(() => {
    const user = this.submittedUser();
    return user ? JSON.stringify(user, null, 2) : '';
  });

  protected readonly completionPercent = computed(() => {
    const user = this.userModel();
    const values = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      String(user.age),
      user.role,
      user.department,
      user.employmentType,
      user.company || (user.employmentType === 'contractor' ? 'contractor' : ''),
      user.startDate,
      ...user.experience.flatMap((experience) => [experience.company, experience.role]),
      user.address.street,
      user.address.city,
      user.address.state,
      user.address.zipCode,
    ];
    const completed = values.filter((value) => value.trim().length > 0).length;
    return Math.round((completed / values.length) * 100);
  });

  protected readonly selectedSkills = computed(() => {
    const skills = this.userModel().skills;
    return [
      skills.angular ? 'Angular' : '',
      skills.ngrx ? 'NgRx' : '',
      skills.testing ? 'Testing' : '',
    ].filter(Boolean);
  });

  protected resetForm(): void {
    this.userModel.set(createUserDetails());
    this.userForm().reset();
    this.submittedUser.set(undefined);
    this.saveStatus.set('idle');
  }

  protected addExperience(): void {
    this.userModel.update((user) => ({
      ...user,
      experience: [...user.experience, { company: '', role: '' }],
    }));
  }

  protected removeExperience(index: number): void {
    this.userModel.update((user) => ({
      ...user,
      experience: user.experience.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  protected onSubmit(): void {
    submit(this.userForm, async () => {
      this.saveStatus.set('saving');
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.submittedUser.set(this.userModel());
      this.saveStatus.set('saved');
    });
  }
}
