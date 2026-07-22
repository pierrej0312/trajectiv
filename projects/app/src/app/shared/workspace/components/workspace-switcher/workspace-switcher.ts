import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

import { MeWorkspaceApiDto } from '@shared-api-client';

import { WorkspaceNavigationService } from '../../services/workspace-navigation.service';

import { WorkspaceStore } from '../../stores/workspace.store';

export type WorkspaceSwitcherVariant = 'menu' | 'dropdown' | 'compact';

type WorkspaceOption = {
  readonly label: string;
  readonly value: string;
  readonly kind: MeWorkspaceApiDto.KindEnum;

  readonly organizationId?: string;

  readonly organizationRole?: MeWorkspaceApiDto.OrganizationRoleEnum;
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

  private readonly workspaceNavigation = inject(WorkspaceNavigationService);

  readonly variant = input<WorkspaceSwitcherVariant>('menu');

  readonly options = computed<WorkspaceOption[]>(() =>
    this.workspaceStore.workspaces().map((workspace) => ({
      label: workspace.label ?? 'Workspace',

      value: workspace.id!,

      kind: workspace.kind ?? MeWorkspaceApiDto.KindEnum.Personal,

      organizationId: workspace.organizationId,

      organizationRole: workspace.organizationRole,
    })),
  );

  readonly selectedWorkspaceId = computed(() => this.workspaceStore.activeWorkspace()?.id ?? null);

  setActiveWorkspace(workspaceId: string | null | undefined): void {
    if (!workspaceId) {
      return;
    }

    void this.workspaceNavigation.selectWorkspace(workspaceId);
  }

  getIcon(kind: MeWorkspaceApiDto.KindEnum): string {
    return kind === MeWorkspaceApiDto.KindEnum.Organization ? 'pi pi-building' : 'pi pi-user';
  }

  getMeta(option: WorkspaceOption): string {
    if (option.kind === MeWorkspaceApiDto.KindEnum.Personal) {
      return 'Personnel';
    }

    return option.organizationRole
      ? `Organisation · ${formatOrganizationRole(option.organizationRole)}`
      : 'Organisation';
  }
}

function formatOrganizationRole(role: MeWorkspaceApiDto.OrganizationRoleEnum): string {
  switch (role) {
    case MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationOwner:
      return 'Propriétaire';

    case MeWorkspaceApiDto.OrganizationRoleEnum.OrganizationAdmin:
      return 'Administrateur';

    case MeWorkspaceApiDto.OrganizationRoleEnum.Recruiter:
      return 'Recruteur';

    case MeWorkspaceApiDto.OrganizationRoleEnum.Coach:
      return 'Coach';

    case MeWorkspaceApiDto.OrganizationRoleEnum.Trainer:
      return 'Formateur';

    case MeWorkspaceApiDto.OrganizationRoleEnum.Learner:
      return 'Apprenant';
  }
}
