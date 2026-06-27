import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormFieldError } from './form-field-error';

@Component({
  selector: 'app-form-datepicker',
  imports: [FormField, FormFieldError, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  template: `
    <mat-form-field appearance="outline" [class.full-width]="true">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [formField]="field()"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
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
export class FormDatepicker {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
}
