import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormFieldError } from './form-field-error';

export type SelectOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-form-select',
  imports: [FormField, FormFieldError, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" [class.full-width]="true">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [formField]="field()">
        @for (option of options(); track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
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
export class FormSelect {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly wide = input(false);
}
