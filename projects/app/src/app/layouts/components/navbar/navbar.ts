import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
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

type NavbarMenuItem = MenuItem & {
  kind?: 'theme-toggle';
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
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly themeService = inject(ThemeService);
  private $keycloak = inject(KeycloakStore);

  readonly profileMenu = viewChild<Menu>('profileMenu');
  readonly drawerVisible = signal(false);

  readonly emptyMenuItems = signal<MenuItem[]>([]);

  readonly isDarkTheme = signal(this.themeService.isDarkTheme());

  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Dark mode' : 'Light mode'));
  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly profileItems = signal<NavbarMenuItem[]>([
    {
      label: 'Account',
      icon: 'pi pi-user',
      routerLink: '/app/account',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      routerLink: '/app/settings',
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
        this.$keycloak.logout();
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

  toggleProfileMenu(event: Event): void {
    this.profileMenu()?.toggle(event);
  }
}
