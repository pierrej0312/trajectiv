import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';

import { PageGridDirective, PageGridItemDirective, PageHeader, PageLayout } from '@shared-ui';

import { WorkspaceStore } from '@shared/workspace/stores/workspace.store';

import { OrganizationMembersStore } from '../../stores/organization-members.store';

import { MemberTable } from '../../components/member-table/member-table';
import { ProgressBar } from 'primeng/progressbar';
import { OrganizationMemberResponseApiDto } from '@shared-api-client';

type OrganizationTeamTab = 'members' | 'invitations';

@Component({
  selector: 'app-organization-team-page',

  imports: [
    ButtonModule,
    Card,
    Panel,
    TabsModule,
    Tooltip,
    ProgressBar,

    PageLayout,
    PageHeader,
    PageGridDirective,
    PageGridItemDirective,

    MemberTable,
  ],

  templateUrl: './organization-team-page.html',

  styleUrl: './organization-team-page.css',

  providers: [OrganizationMembersStore],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationTeamPage {
  readonly membersStore = inject(OrganizationMembersStore);

  readonly workspaceStore = inject(WorkspaceStore);

  readonly activeTab = signal<OrganizationTeamTab>('members');

  readonly inviteDialogVisible = signal(false);

  readonly activeMemberPercentage = computed(() => {
    const total = this.membersStore.memberCount();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.membersStore.activeMemberCount() / total) * 100);
  });

  readonly memberStatus = OrganizationMemberResponseApiDto.StatusEnum;

  readonly activeWorkspaceLabel = computed(
    () => this.workspaceStore.activeWorkspace()?.label?.trim() || 'l’organisation',
  );

  readonly hasSuspendedMembers = computed(() => this.membersStore.suspendedMemberCount() > 0);

  openInviteDialog(): void {
    if (!this.membersStore.canInviteMembers()) {
      return;
    }

    this.inviteDialogVisible.set(true);
  }

  showSuspendedMembers(): void {
    this.activeTab.set('members');

    this.membersStore.setStatusFilter(OrganizationMemberResponseApiDto.StatusEnum.Suspended);
  }

  showAllMembers(): void {
    this.membersStore.setStatusFilter(null);
  }

  closeInviteDialog(): void {
    this.inviteDialogVisible.set(false);
  }

  setActiveTab(tab: string | number): void {
    if (tab === 'members' || tab === 'invitations') {
      this.activeTab.set(tab);
    }
  }
}
