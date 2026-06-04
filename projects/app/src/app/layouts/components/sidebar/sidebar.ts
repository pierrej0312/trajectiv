import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Menu, MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { TrajectivLogo } from '@shared-ui';
import { ThemeService } from '@themes/theme.service';
import { KeycloakStore } from '@shared/module/keycloak/keycloak-store';
import { ButtonModule } from 'primeng/button';

type SidebarChildItem = {
  label: string;
  icon: string;
  routerLink: string;
  badge?: string;
};

type SidebarNavItem = MenuItem & {
  routerLink?: string;
  badge?: string;
  children?: SidebarChildItem[];
  type?: 'link' | 'button' | 'toggle';
};

type SidebarSection = MenuItem & {
  items: SidebarNavItem[];
};

type ProfileMenuItem = MenuItem & {
  kind?: 'theme-toggle';
};

@Component({
  selector: 'app-sidebar',
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    MenuModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
    ToggleButtonModule,
    TrajectivLogo,
    ButtonModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly themeService = inject(ThemeService);
  private readonly keycloakStore = inject(KeycloakStore);
  private readonly router = inject(Router);

  readonly profileMenu = viewChild<Menu>('profileMenu');

  readonly openedItems = signal<Set<string>>(new Set());

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());

  readonly themeLabel = computed(() => (this.isDarkTheme() ? 'Dark mode' : 'Light mode'));
  readonly themeIcon = computed(() => (this.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'));

  readonly items = signal<SidebarSection[]>([
    {
      label: 'Principal',
      items: [
        {
          label: 'Pilotage',
          icon: 'pi pi-chart-line',
          routerLink: '/app/pilotage',
        },
        {
          label: 'Opportunités',
          icon: 'pi pi-bullseye',
          routerLink: '/app/opportunities',
          children: [
            {
              label: 'Toutes',
              icon: 'pi pi-list',
              routerLink: '/app/opportunities',
            },
            {
              label: 'Nouvelle',
              icon: 'pi pi-plus',
              routerLink: '/app/opportunities/new',
            },
          ],
        },
        {
          label: 'Questions',
          icon: 'pi pi-comments',
          routerLink: '/app/questions',
          children: [
            {
              label: 'Radar',
              icon: 'pi pi-compass',
              routerLink: '/app/questions/radar',
            },
            {
              label: 'Training',
              icon: 'pi pi-microphone',
              routerLink: '/app/questions/training',
            },
          ],
        },
        {
          label: 'Actions',
          icon: 'pi pi-sparkles',
          routerLink: '/app/actions',
          badge: '4',
        },
        {
          label: 'Ajouter opportunité',
          icon: 'pi pi-plus',
          command: () => {
            this.createOpportunity();
          },
          type: 'button',
        },
      ],
    },
    {
      label: 'Système',
      items: [
        {
          label: 'Notifications',
          icon: 'pi pi-bell',
          routerLink: '/app/notifications',
          badge: '2',
        },
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          routerLink: '/app/settings',
        },
      ],
    },
  ]);

  readonly profileItems = signal<ProfileMenuItem[]>([
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
        this.keycloakStore.logout();
      },
    },
  ]);

  toggle(item: SidebarNavItem): void {
    if (!item.children?.length || !item.label) {
      return;
    }

    this.openedItems.update((current) => {
      const next = new Set(current);

      if (next.has(item.label!)) {
        next.delete(item.label!);
      } else {
        next.add(item.label!);
      }

      return next;
    });
  }

  isOpened(item: SidebarNavItem): boolean {
    return !!item.label && this.openedItems().has(item.label);
  }

  setDarkTheme(value: boolean | undefined): void {
    console.log('setDarkTheme', value);
    this.themeService.set(value ? 'dark' : 'light');
  }

  toggleProfileMenu(event: Event): void {
    this.profileMenu()?.toggle(event);
  }

  createOpportunity(): void {
    void this.router.navigate(['/app/opportunities/new']);
  }
}
