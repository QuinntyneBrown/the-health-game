import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideApiServices } from 'api';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideApiServices({
      apiBaseUrl: environment.apiBaseUrl,
      oidcAuthority: environment.oidcAuthority,
      oidcClientId: environment.oidcClientId,
      oidcScopes: environment.oidcScopes,
      oidcRedirectUri: environment.oidcRedirectUri,
      oidcPostLogoutRedirectUri: environment.oidcPostLogoutRedirectUri,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
