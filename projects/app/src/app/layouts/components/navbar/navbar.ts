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
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { AppContextStore, ShellStore, type AppNavItem } from '@core';

import { TrajectivLogo } from '@shared-ui';
import { ThemeService } from '@themes/theme.service';

import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';

import { WorkspaceStore } from '@shared/workspace/workspace.store';

import { WorkspaceSwitcher } from '@shared/workspace/components/workspace-switcher/workspace-switcher';
import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

type NavbarMenuItem = MenuItem & {
  readonly kind?: 'theme-toggle' | 'workspace-switcher';
};

@Component({
  selector: 'app-navbar',

  imports: [
    FormsModule,
    RouterLink,
    MenubarModule,
    MenuModule,
    DrawerModule,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    ToggleButtonModule,
    TrajectivLogo,
    WorkspaceSwitcher,
  ],

  templateUrl: './navbar.html',
  styleUrl: './navbar.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly themeService = inject(ThemeService);

  private readonly keycloakStore = inject(KeycloakStore);

  private readonly navigation = inject(NavigationStore);

  private readonly workspaceStore = inject(WorkspaceStore);

  private readonly router = inject(Router);

  readonly shell = inject(ShellStore);

  readonly appContext = inject(AppContextStore);

  readonly profileMenu = viewChild<Menu>('profileMenu');

  readonly drawerVisible = signal(false);

  readonly emptyMenuItems = signal<MenuItem[]>([]);

  readonly drawerItems = this.navigation.drawerItems;

  readonly activeWorkspace = this.workspaceStore.activeWorkspace;

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());

  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Mode sombre' : 'Mode clair'));

  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly profileItems = computed<NavbarMenuItem[]>(() => {
    const navigationItems: NavbarMenuItem[] = this.navigation
      .profileMenuItems()
      .filter(
        (
          item,
        ): item is AppNavItem & {
          readonly route: string;
        } => typeof item.route === 'string' && item.route.length > 0,
      )
      .map(
        (item): NavbarMenuItem => ({
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

  setDarkTheme(value: boolean): void {
    this.themeService.set(value ? 'dark' : 'light');
  }

  openDrawer(): void {
    this.drawerVisible.set(true);
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
  }

  logout(): void {
    void this.keycloakStore.logout();
  }

  toggleProfileMenu(event: Event): void {
    this.profileMenu()?.toggle(event);
  }

  goBack(): void {
    const parentNavItemId = this.shell.parentNavItemId();

    const parentItem = this.navigation.visibleItems().find((item) => item.id === parentNavItemId);

    if (parentItem?.route) {
      void this.router.navigateByUrl(parentItem.route);

      return;
    }

    globalThis.history.back();
  }
}
