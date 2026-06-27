import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-form-field-error',
  imports: [MatFormFieldModule],
  template: `
    @if (field()().touched() && field()().errors().length) {
      <mat-error>
        {{ field()().errors()[0].message }}
      </mat-error>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError {
  readonly field = input.required<FieldTree<unknown>>();
}
