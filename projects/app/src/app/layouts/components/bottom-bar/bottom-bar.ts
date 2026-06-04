import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

type BottomBarChildItem = {
  label: string;
  icon: string;
  routerLink: string;
  ariaLabel: string;
};

type BottomBarItem = {
  label: string;
  icon: string;
  routerLink: string;
  ariaLabel: string;
  children?: BottomBarChildItem[];
};

@Component({
  selector: 'app-bottom-bar',
  imports: [RouterLink, RouterLinkActive, RippleModule],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.css',
})
export class BottomBar {
  private readonly router = inject(Router);

  readonly activeChildrenMenu = signal<string | null>(null);

  readonly items = signal<BottomBarItem[]>([
    {
      label: 'Pilotage',
      icon: 'pi pi-chart-line',
      routerLink: '/app/pilotage',
      ariaLabel: 'Aller au pilotage',
    },
    {
      label: 'Opportunités',
      icon: 'pi pi-bullseye',
      routerLink: '/app/opportunities',
      ariaLabel: 'Voir les raccourcis opportunités',
      children: [
        {
          label: 'Toutes',
          icon: 'pi pi-list',
          routerLink: '/app/opportunities',
          ariaLabel: 'Voir toutes les opportunités',
        },
        {
          label: 'Nouvelle',
          icon: 'pi pi-plus',
          routerLink: '/app/opportunities/new',
          ariaLabel: 'Créer une nouvelle opportunité',
        },
      ],
    },
    {
      label: 'Questions',
      icon: 'pi pi-comments',
      routerLink: '/app/questions',
      ariaLabel: 'Voir les raccourcis questions',
      children: [
        {
          label: 'Radar',
          icon: 'pi pi-compass',
          routerLink: '/app/questions/radar',
          ariaLabel: 'Ouvrir le radar de questions',
        },
        {
          label: 'Training',
          icon: 'pi pi-microphone',
          routerLink: '/app/questions/training',
          ariaLabel: 'Démarrer un entraînement',
        },
      ],
    },
    {
      label: 'Actions',
      icon: 'pi pi-sparkles',
      routerLink: '/app/actions',
      ariaLabel: 'Voir les actions',
    },
  ]);

  toggleChildrenMenu(item: BottomBarItem): void {
    if (!item.children?.length) {
      return;
    }

    this.activeChildrenMenu.update((current) =>
      current === item.routerLink ? null : item.routerLink,
    );
  }

  closeChildrenMenu(): void {
    this.activeChildrenMenu.set(null);
  }

  isChildrenMenuOpen(item: BottomBarItem): boolean {
    return this.activeChildrenMenu() === item.routerLink;
  }

  isParentActive(item: BottomBarItem): boolean {
    return this.router.url.startsWith(item.routerLink);
  }

  navigateToChild(child: BottomBarChildItem): void {
    this.closeChildrenMenu();
    void this.router.navigateByUrl(child.routerLink);
  }
}
