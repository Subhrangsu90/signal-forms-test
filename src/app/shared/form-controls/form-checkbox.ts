import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormFieldError } from './form-field-error';

@Component({
  selector: 'app-form-checkbox',
  imports: [FormField, FormFieldError, MatCheckboxModule],
  template: `
    <div class="checkbox-container">
      <mat-checkbox [formField]="field()">
        {{ label() }}
      </mat-checkbox>
      <app-form-field-error [field]="field()" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .checkbox-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckbox {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<boolean>>();
}
