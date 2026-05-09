import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'api';

@Component({
  selector: 'app-auth-callback',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbackComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const state = params.get('state');
    if (code && state) {
      void this.auth.handleRedirect(code, state).then(() => {
        const target = this.auth.consumeReturnUrl() ?? '/home';
        void this.router.navigateByUrl(target);
      });
    }
  }
}
