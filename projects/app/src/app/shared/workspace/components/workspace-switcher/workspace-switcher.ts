import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

import { WorkspaceStore } from '@shared/workspace/workspace.store';
import type { WorkspaceContext } from '@core';

export type WorkspaceSwitcherVariant = 'menu' | 'dropdown' | 'compact';

type WorkspaceOption = {
  label: string;
  value: string;
  kind: WorkspaceContext['kind'];
  organizationId?: string;
};

@Component({
  selector: 'app-workspace-switcher',
  imports: [FormsModule, SelectModule],
  templateUrl: './workspace-switcher.html',
  styleUrl: './workspace-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSwitcher {
  private readonly workspaceStore = inject(WorkspaceStore);

  readonly variant = input<WorkspaceSwitcherVariant>('menu');

  readonly activeWorkspace = this.workspaceStore.activeWorkspace;

  readonly options = computed<WorkspaceOption[]>(() =>
    this.workspaceStore.workspaces().map((workspace) => ({
      label: workspace.label,
      value: workspace.id,
      kind: workspace.kind,
      organizationId: workspace.organizationId,
    })),
  );

  readonly selectedWorkspaceId = computed(() => {
    return this.activeWorkspace()?.id ?? 'personal';
  });

  setActiveWorkspace(workspaceId: string | null | undefined): void {
    if (!workspaceId) {
      return;
    }

    this.workspaceStore.setActiveWorkspace(workspaceId);
  }

  getIcon(kind: WorkspaceContext['kind']): string {
    return kind === 'organization' ? 'pi pi-building' : 'pi pi-user';
  }

  getMeta(kind: WorkspaceContext['kind']): string {
    return kind === 'organization' ? 'Organisation' : 'Personnel';
  }
}
