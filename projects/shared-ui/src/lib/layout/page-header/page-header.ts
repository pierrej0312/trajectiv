import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import type { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { ShellStore } from '@core';

@Component({
  selector: 'lib-page-header',

  imports: [BreadcrumbModule],

  templateUrl: './page-header.html',
  styleUrl: './page-header.css',

  changeDetection: ChangeDetectionStrategy.OnPush,

  host: {
    class: 'tr-page-header',
  },
})
export class PageHeader {
  private readonly shell = inject(ShellStore);

  readonly title = input.required<string>();

  readonly description = input<string | null>(null);

  readonly eyebrow = input<string | null>(null);

  readonly icon = input<string | null>(null);

  readonly showBreadcrumb = input(false);

  readonly breadcrumbModel = computed<MenuItem[]>(() => {
    if (!this.showBreadcrumb()) {
      return [];
    }

    return this.shell.breadcrumbs().map(
      (item): MenuItem => ({
        label: item.label,

        icon: item.icon ?? undefined,

        routerLink: item.route ?? undefined,

        disabled: item.route === null,

        ariaLabel: item.current ? `${item.label}, page actuelle` : item.label,
      }),
    );
  });

  readonly shouldShowBreadcrumb = computed(
    () => this.showBreadcrumb() && this.breadcrumbModel().length > 0,
  );
}
