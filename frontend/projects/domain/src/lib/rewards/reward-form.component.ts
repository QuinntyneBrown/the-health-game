import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-reward-form',
  templateUrl: './reward-form.component.html',
  styleUrl: './reward-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardFormComponent {}
