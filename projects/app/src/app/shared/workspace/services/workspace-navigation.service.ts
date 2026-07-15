import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';
import { NavigationStore } from '@app/src/app/core/navigation/navigation.store';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceNavigationService {
  private readonly router = inject(Router);
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly navigationStore = inject(NavigationStore);

  async selectWorkspace(workspaceId: string): Promise<void> {
    this.workspaceStore.setActiveWorkspace(workspaceId);

    const currentUrl = this.router.url;

    const currentRouteStillVisible = this.navigationStore
      .visibleItems()
      .some((item) => this.matchesItemOrChild(currentUrl, item));

    if (currentRouteStillVisible) {
      return;
    }

    const fallback = this.navigationStore
      .visibleItems()
      .find((item) => typeof item.route === 'string' && item.route.length > 0);

    await this.router.navigateByUrl(fallback?.route ?? '/app/dashboard');
  }

  private matchesItemOrChild(
    currentUrl: string,
    item: {
      readonly route?: string;
      readonly children?: readonly {
        readonly route: string;
      }[];
    },
  ): boolean {
    if (item.route && this.matchesRoute(currentUrl, item.route)) {
      return true;
    }

    return item.children?.some((child) => this.matchesRoute(currentUrl, child.route)) ?? false;
  }

  private matchesRoute(currentUrl: string, route: string): boolean {
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }
}
