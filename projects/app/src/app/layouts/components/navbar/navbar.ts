import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { ThemeService } from '@themes/theme.service';
import { TrajectivLogo } from '@shared-ui';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { NavigationService } from '@shared/navigation/navigation.service';
import { WorkspaceStore } from '@shared/workspace/workspace.store';
import { WorkspaceSwitcher } from '@shared/workspace/components/workspace-switcher/workspace-switcher';
import { AppContextStore } from '@core';
import { NavigationStore } from '@shared/navigation/navigation.store';

type NavbarMenuItem = MenuItem & {
  kind?: 'theme-toggle' | 'workspace-switcher';
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
})
export class Navbar {
  private readonly themeService = inject(ThemeService);
  private readonly keycloakStore = inject(KeycloakStore);
  private readonly navigationService = inject(NavigationService);
  private readonly workspaceStore = inject(WorkspaceStore);

  readonly shellNavigation = inject(NavigationStore);

  readonly appContext = inject(AppContextStore);

  readonly profileMenu = viewChild<Menu>('profileMenu');
  readonly drawerVisible = signal(false);

  readonly emptyMenuItems = signal<MenuItem[]>([]);
  readonly drawerItems = this.navigationService.drawerItems;
  readonly activeWorkspace = this.workspaceStore.activeWorkspace;

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());
  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Dark mode' : 'Light mode'));
  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly profileItems = signal<NavbarMenuItem[]>([
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
}
