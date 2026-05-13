import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  host: {
    '[class.health-text-field--error]': '!!errorText',
  },
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
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
  @Input() testId = '';
  @Output() valueChange = new EventEmitter<string>();
  protected isPasswordVisible = false;

  onInput(value: string): void { this.valueChange.emit(value); }
  togglePasswordVisibility(): void { this.isPasswordVisible = !this.isPasswordVisible; }

  get fieldValue(): string { return `${this.value ?? ''}`; }
  get resolvedType(): string { return this.passwordToggle && this.isPasswordVisible ? 'text' : this.type; }
  get passwordToggleIcon(): string { return this.isPasswordVisible ? 'visibility_off' : 'visibility'; }

}
