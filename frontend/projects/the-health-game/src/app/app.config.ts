import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideApiServices } from 'api';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideViewport } from './viewport/viewport.signal';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideApiServices({ apiBaseUrl: environment.apiBaseUrl }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideViewport(),
  ],
};
