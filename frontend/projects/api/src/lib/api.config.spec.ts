// Acceptance Test
// Traces to: L2-013, L2-017
// Description: provideApiServices accepts an ApiConfig and registers API_CONFIG.
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, ApiConfig } from './api.config';
import { provideApiServices } from './api.providers';

describe('API_CONFIG', () => {
  it('is registered with the value passed to provideApiServices', () => {
    const config: ApiConfig = { apiBaseUrl: 'https://api.example.test' };

    TestBed.configureTestingModule({ providers: [provideApiServices(config)] });

    expect(TestBed.inject(API_CONFIG)).toEqual(config);
  });
});
