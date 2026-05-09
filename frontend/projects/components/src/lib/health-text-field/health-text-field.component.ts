import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule, type MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export type HealthTextFieldType = 'email' | 'number' | 'password' | 'search' | 'text';

@Component({
  selector: 'hg-health-text-field',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './health-text-field.component.html',
  styleUrl: './health-text-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthTextFieldComponent {
  readonly valueChange = output<string>();
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly disabled = input(false);
  readonly errorText = input('');
  readonly helperText = input('');
  readonly icon = input<string | null>(null);
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly readonly = input(false);
  readonly type = input<HealthTextFieldType>('text');
  readonly value = input('');

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
