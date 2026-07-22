import { inject, Injectable } from '@angular/core';

import { Router } from '@angular/router';

import type { AppNavItem } from '@core';

import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

import { WorkspaceStore } from '../stores/workspace.store';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceNavigationService {
  private readonly router = inject(Router);

  private readonly workspaceStore = inject(WorkspaceStore);

  private readonly navigationStore = inject(NavigationStore);

  async selectWorkspace(workspaceId: string): Promise<void> {
    const workspaceSelected = this.workspaceStore.setActiveWorkspace(workspaceId);

    if (!workspaceSelected) {
      return;
    }

    const currentUrl = normalizeUrl(this.router.url);

    const currentRouteStillVisible = this.navigationStore
      .visibleItems()
      .some((item) => this.matchesItemOrChild(currentUrl, item));

    if (currentRouteStillVisible) {
      return;
    }

    const fallback = this.navigationStore.homeItem();

    await this.router.navigateByUrl(fallback?.route ?? '/app/dashboard');
  }

  private matchesItemOrChild(currentUrl: string, item: AppNavItem): boolean {
    if (item.route && matchesRoute(currentUrl, item.route)) {
      return true;
    }

    return item.children?.some((child) => matchesRoute(currentUrl, child.route)) ?? false;
  }
}

function normalizeUrl(url: string): string {
  return url.split('?')[0]?.split('#')[0] ?? url;
}

function matchesRoute(currentUrl: string, route: string): boolean {
  return currentUrl === route || currentUrl.startsWith(`${route}/`);
}
