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
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { AppContextStore, type AppNavItem, ShellStore } from '@core';

import { TrajectivLogo } from '@shared-ui';
import { ThemeService } from '@themes/theme.service';

import { OnboardingStore } from '@features/onboarding/store/onboarding.store';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';

import { WorkspaceSwitcher } from '@shared/workspace/components/workspace-switcher/workspace-switcher';
import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

type SidebarChildItem = {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly routerLink: string;
  readonly badge: string | null;
};

type SidebarNavItem = MenuItem & {
  readonly id?: string;
  readonly routerLink?: string;
  readonly badge?: string | null;
  readonly children?: SidebarChildItem[];

  readonly type?: 'link' | 'button';
};

type SidebarSection = MenuItem & {
  readonly key: string;
  readonly label: string;
  readonly items: SidebarNavItem[];
};

type ProfileMenuItem = MenuItem & {
  readonly kind?: 'theme-toggle' | 'workspace-switcher';
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

  private readonly workspaceStore = inject(WorkspaceStore);

  private readonly navigation = inject(NavigationStore);

  private readonly router = inject(Router);

  readonly appContext = inject(AppContextStore);

  readonly shell = inject(ShellStore);

  readonly onboarding = inject(OnboardingStore);

  readonly profileMenu = viewChild<Menu>('profileMenu');

  readonly openedItemId = signal<string | null>(null);

  readonly activeWorkspace = this.workspaceStore.activeWorkspace;

  readonly isPersonalPremium = computed(() => this.appContext.personalPlanCode() === 'PREMIUM');

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());

  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Mode sombre' : 'Mode clair'));

  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly items = computed<SidebarSection[]>(() => {
    const sections: SidebarSection[] = [
      this.createSection('main', 'Principal', this.navigation.mainSidebarItems()),

      this.createSection(
        'organization',
        'Organisation',
        this.navigation.organizationSidebarItems(),
      ),

      this.createSection('system', 'Système', this.navigation.systemSidebarItems()),

      this.createSection('admin', 'Administration', this.navigation.adminSidebarItems()),
    ];

    return sections.filter((section) => section.items.length > 0);
  });

  readonly profileItems = computed<ProfileMenuItem[]>(() => {
    const navigationItems: ProfileMenuItem[] = this.navigation
      .profileMenuItems()
      .filter(
        (
          item,
        ): item is AppNavItem & {
          readonly route: string;
        } => typeof item.route === 'string' && item.route.length > 0,
      )
      .map(
        (item): ProfileMenuItem => ({
          label: item.label,
          icon: item.icon,
          routerLink: item.route,
        }),
      );

    return [
      {
        kind: 'workspace-switcher',
        label: 'Workspace',
      },
      {
        separator: true,
      },
      ...navigationItems,
      {
        separator: true,
      },
      {
        kind: 'theme-toggle',
        label: 'Thème',
      },
      {
        separator: true,
      },
      {
        label: 'Se déconnecter',
        icon: 'pi pi-sign-out',
        command: () => {
          void this.keycloakStore.logout();
        },
      },
    ];
  });

  isChildRouteActive(parent: SidebarNavItem, child: SidebarChildItem): boolean {
    const activeChild = this.getActiveChild(parent);

    return activeChild?.routerLink === child.routerLink;
  }

  toggle(item: SidebarNavItem): void {
    if (!item.children?.length || !item.id) {
      return;
    }

    this.openedItemId.update((current) => (current === item.id ? null : (item.id ?? null)));
  }

  isOpened(item: SidebarNavItem): boolean {
    return !!item.id && this.openedItemId() === item.id;
  }

  closeOpenedItem(): void {
    this.openedItemId.set(null);
  }

  isRouteActive(item: SidebarNavItem): boolean {
    const currentUrl = this.shell.currentUrl();

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

  private createSection(key: string, label: string, items: readonly AppNavItem[]): SidebarSection {
    const menuItems: SidebarNavItem[] = items.map((item): SidebarNavItem => {
      const children: SidebarChildItem[] = (item.children ?? []).map(
        (child): SidebarChildItem => ({
          key: child.id,
          label: child.label,
          icon: child.icon,
          routerLink: child.route,
          badge: null,
        }),
      );

      return {
        id: item.id,
        label: item.label,
        icon: item.icon,
        routerLink: item.route,
        badge: undefined,
        type: item.type === 'button' ? 'button' : 'link',

        command:
          item.type === 'button' && item.route
            ? () => this.navigateAndClose(item.route ?? '')
            : undefined,

        children,
      };
    });

    return {
      key,
      label,
      items: menuItems,
    };
  }

  private getActiveChild(parent: SidebarNavItem): SidebarChildItem | null {
    const currentUrl = this.shell.currentUrl();

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

  private isRouteMatch(currentUrl: string, route: string): boolean {
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }
}
