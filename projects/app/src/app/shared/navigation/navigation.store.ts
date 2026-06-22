import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export type ShellMode = 'onboarding' | 'app';
export type SidebarVariant = 'onboarding-stepper' | 'app-navigation';
export type NavbarVariant = 'onboarding' | 'app';
export type BottomBarVariant = 'hidden' | 'app-navigation';

@Injectable({
  providedIn: 'root',
})
export class NavigationStore {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUrl = signal(this.normalizeUrl(this.router.url));

  readonly shellMode = computed<ShellMode>(() => {
    return this.currentUrl().startsWith('/app/onboarding') ? 'onboarding' : 'app';
  });

  readonly sidebarVariant = computed<SidebarVariant>(() => {
    return this.shellMode() === 'onboarding' ? 'onboarding-stepper' : 'app-navigation';
  });

  readonly navbarVariant = computed<NavbarVariant>(() => {
    return this.shellMode() === 'onboarding' ? 'onboarding' : 'app';
  });

  readonly bottomBarVariant = computed<BottomBarVariant>(() => {
    return this.shellMode() === 'onboarding' ? 'hidden' : 'app-navigation';
  });

  readonly showNavbar = computed(() => true);
  readonly showSidebar = computed(() => true);
  readonly showBottomBar = computed(() => this.bottomBarVariant() !== 'hidden');

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(this.normalizeUrl(event.urlAfterRedirects));
      });
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0]?.split('#')[0] ?? url;
  }
}
