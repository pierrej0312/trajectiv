import type { AccessContext } from '../access/access-context.model';
import { canAccess } from '../access/can-access.util';
import type { AppNavChildItem, AppNavItem } from './app-navigation.model';

export function canSeeNavItem(item: AppNavItem, context: AccessContext): boolean {
  return canAccess(item, context);
}

export function canSeeNavChildItem(item: AppNavChildItem, context: AccessContext): boolean {
  return canAccess(item, context);
}
