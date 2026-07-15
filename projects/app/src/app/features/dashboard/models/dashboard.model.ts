export type DashboardProfileVm = {
  readonly displayName: string;
  readonly firstName: string;
  readonly avatarUrl: string | null;
  readonly initials: string;
};

export type DashboardSubscriptionVm = {
  readonly label: string;
  readonly premium: boolean;
};

export type DashboardCreditsVm = {
  readonly monthlyLimit: number;
  readonly used: number;
  readonly remaining: number;
  readonly usedPercentage: number;
  readonly remainingPercentage: number;
  readonly exhausted: boolean;

  readonly nextRenewalDate: string | null;
  readonly renewalDays: number | null;
  readonly renewalLabel: string | null;
};

export type DashboardProfileCompletionVm = {
  readonly percentage: number;
  readonly missingCount: number;
  readonly recommendedActionCount: number;
  readonly complete: boolean;
};
export type DashboardHeroVm = {
  readonly firstName: string;
  readonly targetRoleLabel: string | null;
};
