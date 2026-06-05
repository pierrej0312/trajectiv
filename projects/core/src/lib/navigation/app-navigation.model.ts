import type { AccessRequirement } from '../access/can-access.util';

export type AppNavSectionId = 'main' | 'system';

export type AppNavItemType = 'link' | 'button';

export type AppNavChildItem = AccessRequirement & {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly badge?: string;
  readonly ariaLabel?: string;
};

export type AppNavItem = AccessRequirement & {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly section: AppNavSectionId;
  readonly route?: string;
  readonly type?: AppNavItemType;
  readonly badge?: string;
  readonly ariaLabel?: string;
  readonly desktop?: boolean;
  readonly mobile?: boolean;
  readonly drawer?: boolean;
  readonly children?: readonly AppNavChildItem[];
};

export type AppNavSection = {
  readonly id: AppNavSectionId;
  readonly label: string;
  readonly items: readonly AppNavItem[];
};
