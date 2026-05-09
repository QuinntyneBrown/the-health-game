// Acceptance Test
// Traces to: L2-030, L2-031, L2-033
// Description: Verifies a reusable Material-backed component renders from separate files.
import { TestBed } from '@angular/core/testing';

import { AppBrandComponent } from './app-brand.component';

describe('AppBrandComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBrandComponent],
    }).compileComponents();
  });

  it('renders the brand label', () => {
    const fixture = TestBed.createComponent(AppBrandComponent);

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('HealthQuest');
  });
});
