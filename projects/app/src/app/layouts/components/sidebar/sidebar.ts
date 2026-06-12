import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Menu, MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';

import { TrajectivLogo } from '@shared-ui';
import { ThemeService } from '@themes/theme.service';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { NavigationService } from '@shared/navigation/navigation.service';
import { WorkspaceStore } from '@shared/workspace/workspace.store';
import { WorkspaceSwitcher } from '@shared/workspace/components/workspace-switcher/workspace-switcher';
import { AppContextStore } from '@core';

type SidebarChildItem = {
  label: string;
  icon: string;
  routerLink: string;
  badge?: string;
};

type SidebarNavItem = MenuItem & {
  id?: string;
  routerLink?: string;
  badge?: string;
  children?: SidebarChildItem[];
  type?: 'link' | 'button' | 'toggle';
};

type SidebarSection = {
  label: string;
  items: SidebarNavItem[];
};

type ProfileMenuItem = MenuItem & {
  kind?: 'theme-toggle' | 'workspace-switcher';
};

@Component({
  selector: 'app-sidebar',
  imports: [
    FormsModule,
    RouterLink,
    MenuModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
    ToggleButtonModule,
    TrajectivLogo,
    ButtonModule,
    WorkspaceSwitcher,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly themeService = inject(ThemeService);
  private readonly keycloakStore = inject(KeycloakStore);
  private readonly navigationService = inject(NavigationService);
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly router = inject(Router);
  readonly appContext = inject(AppContextStore);

  readonly currentUrl = computed(() => {
    const lastNavigation = this.router.lastSuccessfulNavigation();

    return this.normalizeUrl(lastNavigation?.finalUrl?.toString() ?? this.router.url);
  });

  readonly profileMenu = viewChild<Menu>('profileMenu');

  readonly openedItemId = signal<string | null>(null);

  readonly activeWorkspace = this.workspaceStore.activeWorkspace;

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());
  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Dark mode' : 'Light mode'));
  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly items = computed<SidebarSection[]>(() => [
    {
      label: 'Principal',
      items: this.navigationService.mainDesktopItems().map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        routerLink: item.route,
        badge: item.badge,
        type: item.type,
        command:
          item.type === 'button' && item.route
            ? () => this.navigateAndClose(item.route!)
            : undefined,
        children: item.children?.map((child) => ({
          label: child.label,
          icon: child.icon,
          routerLink: child.route,
          badge: child.badge,
        })),
      })),
    },
    {
      label: 'Système',
      items: this.navigationService.systemDesktopItems().map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        routerLink: item.route,
        badge: item.badge,
        type: item.type,
        command:
          item.type === 'button' && item.route
            ? () => this.navigateAndClose(item.route!)
            : undefined,
        children: item.children?.map((child) => ({
          label: child.label,
          icon: child.icon,
          routerLink: child.route,
          badge: child.badge,
        })),
      })),
    },
  ]);

  readonly profileItems = signal<ProfileMenuItem[]>([
    {
      kind: 'workspace-switcher',
      label: 'Workspace',
    },
    {
      separator: true,
    },
    {
      label: 'Profil',
      icon: 'pi pi-user',
      routerLink: '/app/profile',
    },
    {
      label: 'Compte',
      icon: 'pi pi-id-card',
      routerLink: '/app/account',
    },
    {
      separator: true,
    },
    {
      kind: 'theme-toggle',
      label: 'Theme',
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        void this.keycloakStore.logout();
      },
    },
  ]);

  isChildRouteActive(parent: SidebarNavItem, child: SidebarChildItem): boolean {
    const activeChild = this.getActiveChild(parent);

    return activeChild?.routerLink === child.routerLink;
  }

  toggle(item: SidebarNavItem): void {
    if (!item.children?.length || !item.id) {
      return;
    }

    const itemId = item.id;

    this.openedItemId.update((current) => (current === itemId ? null : itemId));
  }

  isOpened(item: SidebarNavItem): boolean {
    return !!item.id && this.openedItemId() === item.id;
  }

  closeOpenedItem(): void {
    this.openedItemId.set(null);
  }

  isRouteActive(item: SidebarNavItem): boolean {
    const currentUrl = this.currentUrl();

    if (item.children?.length) {
      return item.children.some((child) => this.isRouteMatch(currentUrl, child.routerLink));
    }

    if (!item.routerLink) {
      return false;
    }

    return this.isRouteMatch(currentUrl, item.routerLink);
  }

  navigateAndClose(route: string): void {
    this.closeOpenedItem();
    void this.router.navigateByUrl(route);
  }

  setDarkTheme(value: boolean | undefined): void {
    this.themeService.set(value ? 'dark' : 'light');
  }

  toggleProfileMenu(event: Event): void {
    this.profileMenu()?.toggle(event);
  }

  private getActiveChild(parent: SidebarNavItem): SidebarChildItem | null {
    const currentUrl = this.currentUrl();

    return (
      parent.children
        ?.filter((child) => this.isRouteMatch(currentUrl, child.routerLink))
        .reduce<SidebarChildItem | null>((bestMatch, child) => {
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
