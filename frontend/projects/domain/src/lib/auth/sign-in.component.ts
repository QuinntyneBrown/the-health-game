import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'api';
import { AppBrandComponent, HealthTextFieldComponent } from 'components';

import { InvalidCredentialsError } from './sign-in.service';
import { ISignInService, SIGN_IN_SERVICE } from './sign-in.service.contract';

@Component({
  selector: 'lib-sign-in',
  imports: [AppBrandComponent, FormsModule, HealthTextFieldComponent, MatButtonModule, MatIconModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly signInService = inject<ISignInService>(SIGN_IN_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  constructor() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/')) {
      this.auth.setReturnUrl(returnUrl);
    }
  }

  readonly usernameOrEmail = signal('');
  readonly password = signal('');
  readonly submitted = signal(false);
  readonly busy = signal(false);
  readonly errorMessage = signal('');

  readonly usernameError = computed(() =>
    this.submitted() && this.usernameOrEmail().trim().length === 0
      ? 'Enter your username or email'
      : '',
  );

  readonly passwordError = computed(() =>
    this.submitted() && this.password().length === 0 ? 'Enter your password' : '',
  );

  readonly canSubmit = computed(
    () =>
      !this.busy() &&
      this.usernameOrEmail().trim().length > 0 &&
      this.password().trim().length > 0,
  );

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);

    const identifier = this.usernameOrEmail().trim();
    const password = this.password();

    if (identifier.length === 0 || password.trim().length === 0) {
      return;
    }

    this.busy.set(true);
    this.errorMessage.set('');

    try {
      const result = await this.signInService.signInWithPassword(identifier, password);
      await this.router.navigateByUrl(result.returnUrl);
    } catch (error) {
      if (
        error instanceof InvalidCredentialsError ||
        (error as Error | undefined)?.name === 'InvalidCredentialsError'
      ) {
        this.errorMessage.set('Invalid username or password.');
        this.password.set('');
      } else {
        this.errorMessage.set("We couldn't sign you in. Please try again.");
      }
    } finally {
      this.busy.set(false);
    }
  }

  async onContinueWithOidc(): Promise<void> {
    this.busy.set(true);
    try {
      await this.signInService.startOidcSignIn();
    } finally {
      this.busy.set(false);
    }
  }

  goToOnboarding(): void {
    void this.router.navigateByUrl('/onboarding');
  }
}
