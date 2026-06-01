import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { ThemeService } from './theme.service';

export const provideTheme = (theme: unknown): ApplicationConfig => {
  return {
    providers: [
      providePrimeNG({
        theme: {
          preset: theme,
          options: {
            darkModeSelector: '.dark',
            cssLayer: {
              name: 'primeng',
              order: 'theme, base, primeng',
            },
          },
        },
      }),
      {
        provide: ThemeService,
        useFactory: () => new ThemeService('system'),
      },
      MessageService,
    ],
  };
};
