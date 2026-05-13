import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-reward-list',
  templateUrl: './reward-list.component.html',
  styleUrl: './reward-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardListComponent {}
