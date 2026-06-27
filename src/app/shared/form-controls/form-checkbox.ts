import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldError } from './form-field-error';

@Component({
  selector: 'app-form-checkbox',
  imports: [FormField, FormFieldError],
  template: `
    <label class="grid w-fit gap-1.5 text-sm font-semibold text-slate-800">
      <span class="flex items-center gap-2.5">
        <input class="min-h-4 w-4 accent-indigo-600" type="checkbox" [formField]="field()" />
        <span>{{ label() }}</span>
      </span>
      <app-form-field-error [field]="field()" />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckbox {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<boolean>>();
}
