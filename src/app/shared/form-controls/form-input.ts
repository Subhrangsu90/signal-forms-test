import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormFieldError } from './form-field-error';

type InputKind = 'text' | 'email' | 'tel' | 'number' | 'date';

@Component({
  selector: 'app-form-input',
  imports: [FormField, FormFieldError],
  template: `
    <label class="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-800" [class.sm:col-span-2]="wide()">
      <span>{{ label() }}</span>
      <input
        class="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20"
        [type]="type()"
        [autocomplete]="autocomplete()"
        [inputMode]="inputMode()"
        [placeholder]="placeholder()"
        [formField]="field()"
      />
      <app-form-field-error [field]="field()" />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInput {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string | number>>();
  readonly type = input<InputKind>('text');
  readonly autocomplete = input('');
  readonly inputMode = input('');
  readonly placeholder = input('');
  readonly wide = input(false);
}
