import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldError } from './form-field-error';

export type SelectOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-form-select',
  imports: [FormField, FormFieldError],
  template: `
    <label class="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-800" [class.sm:col-span-2]="wide()">
      <span>{{ label() }}</span>
      <select
        class="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-medium text-slate-950 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20"
        [formField]="field()"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      <app-form-field-error [field]="field()" />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelect {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly wide = input(false);
}
