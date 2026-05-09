import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationBarComponent } from 'components';
import { AppBrandComponent } from 'components/app-brand';

import { NAV_ITEMS } from './nav-items';
import { VIEWPORT } from './viewport/viewport.signal';

@Component({
  selector: 'app-root',
  imports: [AppBrandComponent, MatToolbarModule, NavigationBarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly navItems = NAV_ITEMS;
  readonly viewport = inject(VIEWPORT);

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly activeItemId = computed(() => {
    const url = this.url();
    return NAV_ITEMS.find((item) => item.route === url)?.id ?? 'home';
  });

  onSelect(id: string): void {
    const item = NAV_ITEMS.find((candidate) => candidate.id === id);
    if (item) {
      void this.router.navigateByUrl(item.route);
    }
  }
}
