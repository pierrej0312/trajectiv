import type { AccessRequirement } from '../../access/utils/can-access.util';

export type AppNavItemId =
  | 'dashboard'
  | 'opportunities'
  | 'opportunity-create'
  | 'questions'
  | 'actions'
  | 'notifications'
  | 'profile'
  | 'account'
  | 'settings'
  | 'organization-dashboard';

export type AppNavChildItemId =
  | 'opportunities-all'
  | 'opportunities-new'
  | 'questions-radar'
  | 'questions-training';

export type AppNavSectionId = 'main' | 'organization' | 'system' | 'admin';

export type AppNavPlacement =
  | 'sidebar'
  | 'bottom-bar'
  | 'drawer'
  | 'profile-menu'
  | 'top-navigation';

export type AppNavItemType = 'link' | 'action' | 'button';

export type AppNavBadgeKey =
  | 'recommended-actions'
  | 'notifications'
  | 'opportunities'
  | 'applications-follow-up';

export type AppNavChildItem = AccessRequirement & {
  readonly id: AppNavChildItemId;
  readonly label: string;
  readonly icon: string;
  readonly route: string;

  readonly order: number;

  readonly ariaLabel?: string;
  readonly badgeKey?: AppNavBadgeKey;
};

export type AppNavItem = AccessRequirement & {
  readonly id: AppNavItemId;
  readonly label: string;
  readonly icon: string;
  readonly section: AppNavSectionId;

  readonly route?: string;
  readonly workspaceHome?: boolean;
  readonly type?: AppNavItemType;

  readonly placements: readonly AppNavPlacement[];

  readonly order: number;
  readonly mobileOrder?: number;

  readonly ariaLabel?: string;
  readonly badgeKey?: AppNavBadgeKey;

  readonly children?: readonly AppNavChildItem[];
};
