import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

import { NavigationService } from '@shared/navigation/navigation.service';

type BottomBarChildItem = {
  key: string;
  label: string;
  icon: string;
  routerLink: string;
  ariaLabel: string;
  badge?: string;
};

type BottomBarItem = {
  key: string;
  label: string;
  icon: string;
  ariaLabel: string;
  routerLink: string;
  badge?: string;
  isProfile?: boolean;
  children?: BottomBarChildItem[];
};

type WithRoute<T extends { readonly route?: string }> = T & {
  readonly route: string;
};

@Component({
  selector: 'app-bottom-bar',
  imports: [RouterLink, RouterLinkActive, RippleModule, BadgeModule],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomBar {
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);

  readonly activeChildrenMenuKey = signal<string | null>(null);

  readonly currentUrl = computed(() => {
    const lastNavigation = this.router.lastSuccessfulNavigation();

    return this.normalizeUrl(lastNavigation?.finalUrl?.toString() ?? this.router.url);
  });

  readonly items = computed<BottomBarItem[]>(() => {
    const navigationItems = this.navigationService
      .mobileItems()
      .filter((item) => this.hasRoute(item))
      .map(
        (item): BottomBarItem => ({
          key: item.id,
          label: item.label,
          icon: item.icon,
          routerLink: item.route,
          ariaLabel: item.ariaLabel ?? `Aller à ${item.label}`,
          badge: item.badge,
          isProfile: item.id === 'profile',
          children: item.children
            ?.filter((child) => this.hasRoute(child))
            .map(
              (child): BottomBarChildItem => ({
                key: child.id,
                label: child.label,
                icon: child.icon,
                routerLink: child.route,
                ariaLabel: child.ariaLabel ?? `Aller à ${child.label}`,
                badge: child.badge,
              }),
            ),
        }),
      );

    const hasProfileItem = navigationItems.some((item) => item.key === 'profile');

    if (hasProfileItem) {
      return navigationItems;
    }

    return [...navigationItems, this.createProfileItem()];
  });

  toggleChildrenMenu(item: BottomBarItem): void {
    if (!item.children?.length) {
      return;
    }

    this.activeChildrenMenuKey.update((currentKey) => (currentKey === item.key ? null : item.key));
  }

  closeChildrenMenu(): void {
    this.activeChildrenMenuKey.set(null);
  }

  isChildrenMenuOpen(item: BottomBarItem): boolean {
    return this.activeChildrenMenuKey() === item.key;
  }

  isCompactActive(item: BottomBarItem): boolean {
    const openedKey = this.activeChildrenMenuKey();

    if (openedKey === null) {
      return false;
    }

    if (openedKey === item.key) {
      return false;
    }

    return this.isParentActive(item);
  }

  isParentActive(item: BottomBarItem): boolean {
    const currentUrl = this.currentUrl();

    if (item.children?.length) {
      return item.children.some((child) => this.isRouteMatch(currentUrl, child.routerLink));
    }

    return this.isRouteMatch(currentUrl, item.routerLink);
  }

  isChildActive(parent: BottomBarItem, child: BottomBarChildItem): boolean {
    const activeChild = this.getActiveChild(parent);

    return activeChild?.routerLink === child.routerLink;
  }

  navigateToChild(child: BottomBarChildItem): void {
    this.closeChildrenMenu();
    void this.router.navigateByUrl(child.routerLink);
  }

  private createProfileItem(): BottomBarItem {
    return {
      key: 'profile',
      label: 'Compte',
      icon: 'pi pi-user',
      routerLink: '/app/account',
      ariaLabel: 'Aller au compte',
      isProfile: true,
    };
  }

  private hasRoute<T extends { readonly route?: string }>(item: T): item is WithRoute<T> {
    return typeof item.route === 'string' && item.route.length > 0;
  }
  private getActiveChild(parent: BottomBarItem): BottomBarChildItem | null {
    const currentUrl = this.currentUrl();

    return (
      parent.children
        ?.filter((child) => this.isRouteMatch(currentUrl, child.routerLink))
        .reduce<BottomBarChildItem | null>((bestMatch, child) => {
          if (!bestMatch) {
            return child;
          }

          return child.routerLink.length > bestMatch.routerLink.length ? child : bestMatch;
        }, null) ?? null
    );
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0]?.split('#')[0] ?? url;
  }

  private isRouteMatch(currentUrl: string, route: string): boolean {
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }
}
