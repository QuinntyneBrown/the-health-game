import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, type MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export type HealthTextFieldType = 'email' | 'number' | 'password' | 'search' | 'text';

@Component({
  selector: 'hg-health-text-field',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './health-text-field.component.html',
  styleUrl: './health-text-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.health-text-field--error]': '!!errorText()',
  },
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
  readonly passwordToggle = input(false);
  readonly multiline = input(false);
  readonly rows = input(3);

  private readonly passwordRevealed = signal(false);

  readonly showPasswordToggle = computed(() => this.type() === 'password' && this.passwordToggle());

  readonly effectiveType = computed<HealthTextFieldType>(() =>
    this.showPasswordToggle() && this.passwordRevealed() ? 'text' : this.type(),
  );

  readonly isPasswordRevealed = this.passwordRevealed.asReadonly();

  private static nextId = 0;
  readonly errorId = `hg-health-text-field-error-${++HealthTextFieldComponent.nextId}`;

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }

  togglePasswordVisibility(): void {
    if (!this.showPasswordToggle() || this.disabled()) {
      return;
    }

    this.passwordRevealed.update((revealed) => !revealed);
  }
}
