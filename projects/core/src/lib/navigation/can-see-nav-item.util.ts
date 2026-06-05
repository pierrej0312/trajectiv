import type { AccessContext } from '../access/access-context.model';
import { canAccess } from '../access/can-access.util';
import type { AppNavChildItem, AppNavItem } from './app-navigation.model';

export function canSeeNavItem(item: AppNavItem, context: AccessContext): boolean {
  if (!canAccess(item, context)) {
    return false;
  }

  return true;
}

export function canSeeNavChildItem(item: AppNavChildItem, context: AccessContext): boolean {
  return canAccess(item, context);
}
