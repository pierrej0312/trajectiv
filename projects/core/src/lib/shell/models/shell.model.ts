import type { AppNavItemId } from '../../navigation/models/app-navigation.model';

export type ShellMode = 'app' | 'onboarding' | 'immersive';

export type SidebarVariant = 'app-navigation' | 'onboarding-stepper' | 'hidden';

export type NavbarVariant = 'app' | 'onboarding' | 'immersive' | 'hidden';

export type BottomBarVariant = 'app-navigation' | 'hidden';


/**
 * Configuration finale appliquée au layout.
 */
export type ShellLayoutConfig = {
  readonly sidebarVariant: SidebarVariant;
  readonly navbarVariant: NavbarVariant;
  readonly bottomBarVariant: BottomBarVariant;
};

export type ShellState = {
  readonly currentUrl: string;
  readonly navigating: boolean;
  readonly routeData: ShellRouteData;
};

/**
 * Données déclarées directement dans les routes Angular.
 *
 * Elles décrivent le contexte visuel d'une page, mais pas les
 * permissions ni les éléments de navigation accessibles.
 */

export type ShellRouteData = {
  readonly shellMode?: ShellMode;

  readonly pageTitle?: string;
  readonly pageSubtitle?: string;
  readonly pageIcon?: string;

  readonly parentNavItemId?: AppNavItemId;

  readonly hideSearch?: boolean;
  readonly showBackButton?: boolean;
};
