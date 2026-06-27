import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldError } from './form-field-error';

@Component({
  selector: 'app-form-textarea',
  imports: [FormField, FormFieldError],
  template: `
    <label class="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-800" [class.sm:col-span-2]="wide()">
      <span>{{ label() }}</span>
      <textarea
        class="min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20"
        [autocomplete]="autocomplete()"
        [placeholder]="placeholder()"
        [formField]="field()"
      ></textarea>
      <app-form-field-error [field]="field()" />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTextarea {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly autocomplete = input('');
  readonly placeholder = input('');
  readonly wide = input(false);
}
