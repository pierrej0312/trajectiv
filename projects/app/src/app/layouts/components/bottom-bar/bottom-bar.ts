import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

import { AppContextStore, ShellStore } from '@core';
import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

type BottomBarChildItem = {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly routerLink: string;
  readonly ariaLabel: string;
  readonly badge: string | null;
};

type BottomBarItem = {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly ariaLabel: string;
  readonly routerLink: string;
  readonly badge: string | null;
  readonly isProfile: boolean;
  readonly children: readonly BottomBarChildItem[];
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
  readonly appContext = inject(AppContextStore);
  readonly shell = inject(ShellStore);

  private readonly router = inject(Router);
  private readonly navigation = inject(NavigationStore);

  readonly activeChildrenMenuKey = signal<string | null>(null);

  readonly items = computed<readonly BottomBarItem[]>(() => {
    return this.navigation
      .bottomBarItems()
      .filter((item) => this.hasRoute(item))
      .map(
        (item): BottomBarItem => ({
          key: item.id,
          label: item.label,
          icon: item.icon,
          routerLink: item.route,

          ariaLabel: item.ariaLabel ?? `Aller à ${item.label}`,

          /*
           * Le badge sera résolu ultérieurement depuis badgeKey.
           * Pour le moment, aucune valeur statique n’est affichée.
           */
          badge: null,

          isProfile: item.id === 'profile',

          children: (item.children ?? [])
            .filter((child) => this.hasRoute(child))
            .map(
              (child): BottomBarChildItem => ({
                key: child.id,
                label: child.label,
                icon: child.icon,
                routerLink: child.route,

                ariaLabel: child.ariaLabel ?? `Aller à ${child.label}`,

                badge: null,
              }),
            ),
        }),
      );
  });

  toggleChildrenMenu(item: BottomBarItem): void {
    if (item.children.length === 0) {
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

    if (openedKey === null || openedKey === item.key) {
      return false;
    }

    return this.isParentActive(item);
  }

  isParentActive(item: BottomBarItem): boolean {
    const currentUrl = this.shell.currentUrl();

    if (item.children.length > 0) {
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

  private hasRoute<T extends { readonly route?: string }>(item: T): item is WithRoute<T> {
    return typeof item.route === 'string' && item.route.length > 0;
  }

  private getActiveChild(parent: BottomBarItem): BottomBarChildItem | null {
    const currentUrl = this.shell.currentUrl();

    return parent.children
      .filter((child) => this.isRouteMatch(currentUrl, child.routerLink))
      .reduce<BottomBarChildItem | null>((bestMatch, child) => {
        if (!bestMatch) {
          return child;
        }

        return child.routerLink.length > bestMatch.routerLink.length ? child : bestMatch;
      }, null);
  }

  private isRouteMatch(currentUrl: string, route: string): boolean {
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }
}
