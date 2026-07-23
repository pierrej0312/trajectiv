import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DatePipe } from '@angular/common';

import { Avatar } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { OrganizationMemberResponseApiDto } from '@shared-api-client';

@Component({
  selector: 'app-member-table',

  imports: [DatePipe, Avatar, ButtonModule, TableModule, Tag],

  templateUrl: './member-table.html',
  styleUrl: './member-table.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberTable {
  readonly members = input.required<OrganizationMemberResponseApiDto[]>();

  readonly mutatingMemberIds = input<readonly string[]>([]);

  readonly canUpdateRole = input(false);

  readonly canUpdateStatus = input(false);

  readonly canRemove = input(false);

  readonly roleChange = output<{
    readonly memberId: string;
    readonly role: OrganizationMemberResponseApiDto.RoleEnum;
  }>();

  readonly suspend = output<string>();

  readonly reactivate = output<string>();

  readonly remove = output<string>();

  getDisplayName(member: OrganizationMemberResponseApiDto): string {
    const displayName = member.displayName?.trim();

    if (displayName) {
      return displayName;
    }

    const fullName = [member.firstName?.trim(), member.lastName?.trim()]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .trim();

    return fullName || member.email?.trim() || 'Membre';
  }

  getInitials(member: OrganizationMemberResponseApiDto): string {
    return this.getDisplayName(member)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  getRoleLabel(role: OrganizationMemberResponseApiDto.RoleEnum | undefined): string {
    switch (role) {
      case OrganizationMemberResponseApiDto.RoleEnum.OrganizationOwner:
        return 'Propriétaire';

      case OrganizationMemberResponseApiDto.RoleEnum.OrganizationAdmin:
        return 'Administrateur';

      case OrganizationMemberResponseApiDto.RoleEnum.Recruiter:
        return 'Recruteur';

      case OrganizationMemberResponseApiDto.RoleEnum.Coach:
        return 'Coach';

      case OrganizationMemberResponseApiDto.RoleEnum.Trainer:
        return 'Formateur';

      case OrganizationMemberResponseApiDto.RoleEnum.Learner:
        return 'Apprenant';

      default:
        return 'Rôle non défini';
    }
  }

  getStatusLabel(status: OrganizationMemberResponseApiDto.StatusEnum | undefined): string {
    switch (status) {
      case OrganizationMemberResponseApiDto.StatusEnum.Active:
        return 'Actif';

      case OrganizationMemberResponseApiDto.StatusEnum.Suspended:
        return 'Suspendu';

      default:
        return 'Statut inconnu';
    }
  }

  getStatusSeverity(
    status: OrganizationMemberResponseApiDto.StatusEnum | undefined,
  ): 'success' | 'warn' | 'secondary' {
    switch (status) {
      case OrganizationMemberResponseApiDto.StatusEnum.Active:
        return 'success';

      case OrganizationMemberResponseApiDto.StatusEnum.Suspended:
        return 'warn';

      default:
        return 'secondary';
    }
  }

  isMutating(memberId: string | null | undefined): boolean {
    return typeof memberId === 'string' && this.mutatingMemberIds().includes(memberId);
  }
}
