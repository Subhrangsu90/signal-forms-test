import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-form-field-error',
  template: `
    @if (field()().touched() && field()().errors().length) {
      <small class="text-xs font-semibold text-rose-700">
        {{ field()().errors()[0].message }}
      </small>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError {
  readonly field = input.required<FieldTree<unknown>>();
}
