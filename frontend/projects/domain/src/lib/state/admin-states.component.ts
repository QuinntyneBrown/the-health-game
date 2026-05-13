import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-admin-states',
  templateUrl: './admin-states.component.html',
  styleUrl: './admin-states.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatesComponent {}
