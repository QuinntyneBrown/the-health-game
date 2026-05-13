import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {}
