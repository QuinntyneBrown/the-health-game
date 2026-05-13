import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-create-account',
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent {}
