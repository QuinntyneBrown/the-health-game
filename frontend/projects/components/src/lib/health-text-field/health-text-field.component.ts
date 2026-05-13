import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hg-health-text-field',
  templateUrl: './health-text-field.component.html',
  styleUrl: './health-text-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthTextFieldComponent {
  @Input() label = 'Name';
  @Input() type = 'text';
  @Input() value: string | number = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() disabled = false;
  @Input() isReadonly = false;
  @Input() multiline = false;
  @Input() passwordToggle = false;
  @Output() valueChange = new EventEmitter<string>();

  onInput(value: string): void { this.valueChange.emit(value); }

}
