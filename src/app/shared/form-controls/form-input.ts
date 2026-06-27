import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormFieldError } from './form-field-error';

type InputKind = 'text' | 'email' | 'tel' | 'number' | 'date';

@Component({
  selector: 'app-form-input',
  imports: [FormField, FormFieldError, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" [class.full-width]="true">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="type()"
        [autocomplete]="autocomplete()"
        [inputMode]="inputMode()"
        [placeholder]="placeholder()"
        [formField]="field()"
      />
      <app-form-field-error [field]="field()" />
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
    .full-width {
      width: 100%;
    }
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
