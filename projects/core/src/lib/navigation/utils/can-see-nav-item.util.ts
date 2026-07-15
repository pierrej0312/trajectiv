import type { AccessContext } from '../../access/models/access-context.model';
import { canAccess } from '../../access/utils/can-access.util';

import type { AppNavChildItem, AppNavItem, AppNavPlacement } from '../models/app-navigation.model';

export function canSeeNavItem(item: AppNavItem, context: AccessContext): boolean {
  return canAccess(item, context);
}

export function canSeeNavChildItem(item: AppNavChildItem, context: AccessContext): boolean {
  return canAccess(item, context);
}

export function filterVisibleChildren(item: AppNavItem, context: AccessContext): AppNavItem {
  const children = [...(item.children ?? [])]
    .filter((child) => canSeeNavChildItem(child, context))
    .sort((left, right) => left.order - right.order);

  return {
    ...item,
    children,
  };
}

export function filterByPlacement(
  items: readonly AppNavItem[],
  placement: AppNavPlacement,
): readonly AppNavItem[] {
  return items.filter((item) => item.placements.includes(placement));
}
