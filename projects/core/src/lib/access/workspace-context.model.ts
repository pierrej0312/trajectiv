export type WorkspaceKind = 'personal' | 'organization';

export type WorkspaceContext = {
  readonly id: string;
  readonly kind: WorkspaceKind;
  readonly label: string;
  readonly avatarUrl?: string;
  readonly organizationId?: string;
};
