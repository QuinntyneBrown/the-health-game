import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (!environment.production) {
  document.body.dataset['apiBaseUrl'] = environment.apiBaseUrl;
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
