import { signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'trajectiv-theme-preference';

export class ThemeService {
  readonly preference = signal<ThemePreference>('system');
  readonly resolvedTheme = signal<ResolvedTheme>('light');

  private mediaQuery: MediaQueryList | null = null;

  constructor(private readonly defaultPreference: ThemePreference = 'system') {}

  init(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const preference = this.readSavedPreference() ?? this.defaultPreference;

    this.preference.set(preference);
    this.persistPreferenceIfMissing(preference);
    this.applyTheme();

    this.mediaQuery.addEventListener('change', () => {
      if (this.preference() === 'system') {
        this.applyTheme();
      }
    });
  }

  private persistPreferenceIfMissing(preference: ThemePreference): void {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  }

  set(theme: ThemePreference): void {
    this.preference.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme();
  }

  toggleTheme(): void {
    const nextTheme: ResolvedTheme = this.resolvedTheme() === 'dark' ? 'light' : 'dark';
    this.set(nextTheme);
  }

  isDarkTheme(): boolean {
    return this.resolvedTheme() === 'dark';
  }

  private applyTheme(): void {
    const resolvedTheme = this.resolveTheme();

    this.resolvedTheme.set(resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }

  private resolveTheme(): ResolvedTheme {
    const preference = this.preference();

    if (preference === 'light' || preference === 'dark') {
      return preference;
    }

    return this.mediaQuery?.matches ? 'dark' : 'light';
  }

  private readSavedPreference(): ThemePreference | null {
    const savedPreference = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedPreference === 'system' || savedPreference === 'light' || savedPreference === 'dark') {
      return savedPreference;
    }

    return null;
  }
}
