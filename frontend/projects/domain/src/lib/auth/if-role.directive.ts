import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { AuthService } from 'api';

@Directive({
  selector: '[hgIfRole]',
})
export class IfRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  readonly role = input.required<string>({ alias: 'hgIfRole' });

  constructor() {
    effect(() => {
      this.viewContainer.clear();
      if (this.auth.hasRole(this.role())) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
