import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-auth-session-states',
  templateUrl: './auth-session-states.component.html',
  styleUrl: './auth-session-states.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSessionStatesComponent {}
