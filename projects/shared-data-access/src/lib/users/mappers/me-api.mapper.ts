import {
  MeCreditsApiDto,
  MeOnboardingApiDto,
  MeProfileApiDto,
  MeResponseApiDto,
  MeSubscriptionApiDto,
} from '@shared-api-client';

import {
  AiCreditWallet,
  Me,
  MeOnboarding,
  OnboardingMissingField,
  OnboardingStatus,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  UserProfile,
  UserStatus,
} from '@shared-domain';

const DEFAULT_LANGUAGE = 'fr';

export function mapMeApiDtoToModel(dto: MeResponseApiDto): Me {
  return {
    id: dto.id ?? '',
    keycloakSubject: dto.keycloakSubject ?? '',
    email: dto.email ?? '',
    emailVerified: dto.emailVerified ?? false,
    firstName: dto.firstName ?? null,
    lastName: dto.lastName ?? null,
    displayName: dto.displayName ?? '',
    avatarUrl: dto.avatarUrl ?? null,
    status: mapUserStatus(dto.status),
    onboarding: mapMeOnboardingApiDtoToModel(dto.onboarding),
    profile: mapMeProfileApiDtoToModel(dto.profile),
    subscription: mapMeSubscriptionApiDtoToModel(dto.subscription),
    credits: mapMeCreditsApiDtoToModel(dto.credits),
  };
}

export function mapMeProfileApiDtoToModel(dto?: MeProfileApiDto): UserProfile {
  return {
    careerGoal: dto?.careerGoal ?? null,
    targetRole: dto?.targetRole ?? null,
    experienceLevel: dto?.experienceLevel ?? null,
    preferredLanguage: dto?.preferredLanguage ?? DEFAULT_LANGUAGE,
  };
}

export function mapMeOnboardingApiDtoToModel(dto?: MeOnboardingApiDto): MeOnboarding {
  return {
    status: mapOnboardingStatus(dto?.status),
    completedAt: dto?.completedAt ? new Date(dto.completedAt) : null,
    missingFields: (dto?.missingFields ?? []).map(mapOnboardingMissingField),
  };
}

export function mapMeSubscriptionApiDtoToModel(dto?: MeSubscriptionApiDto): Subscription {
  return {
    plan: mapSubscriptionPlan(dto?.plan),
    status: mapSubscriptionStatus(dto?.status),
  };
}

export function mapMeCreditsApiDtoToModel(dto?: MeCreditsApiDto): AiCreditWallet {
  return {
    monthlyLimit: dto?.monthlyLimit ?? 0,
    used: dto?.used ?? 0,
    remaining: dto?.remaining ?? 0,
  };
}

function mapUserStatus(status: MeResponseApiDto['status']): UserStatus {
  switch (status) {
    case 'ACTIVE':
      return UserStatus.Active;
    case 'DISABLED':
      return UserStatus.Disabled;
    case 'DELETED':
      return UserStatus.Deleted;
    default:
      return UserStatus.Disabled;
  }
}

function mapOnboardingStatus(status: MeOnboardingApiDto['status']): OnboardingStatus {
  switch (status) {
    case 'NOT_STARTED':
      return OnboardingStatus.NotStarted;
    case 'IN_PROGRESS':
      return OnboardingStatus.InProgress;
    case 'COMPLETED':
      return OnboardingStatus.Completed;
    default:
      return OnboardingStatus.NotStarted;
  }
}

function mapOnboardingMissingField(
  field: NonNullable<MeOnboardingApiDto['missingFields']>[number]
): OnboardingMissingField {
  switch (field) {
    case 'CAREER_GOAL':
      return OnboardingMissingField.CareerGoal;
    case 'TARGET_ROLE':
      return OnboardingMissingField.TargetRole;
    case 'EXPERIENCE_LEVEL':
      return OnboardingMissingField.ExperienceLevel;
    default:
      return field satisfies never;
  }
}

function mapSubscriptionPlan(plan: MeSubscriptionApiDto['plan']): SubscriptionPlan {
  switch (plan) {
    case 'FREE':
      return SubscriptionPlan.Free;
    case 'PREMIUM':
      return SubscriptionPlan.Premium;
    default:
      return SubscriptionPlan.Free;
  }
}

function mapSubscriptionStatus(status: MeSubscriptionApiDto['status']): SubscriptionStatus {
  switch (status) {
    case 'ACTIVE':
      return SubscriptionStatus.Active;
    case 'PAST_DUE':
      return SubscriptionStatus.PastDue;
    case 'CANCELED':
      return SubscriptionStatus.Canceled;
    case 'TRIALING':
      return SubscriptionStatus.Trialing;
    case 'EXPIRED':
      return SubscriptionStatus.Expired;
    default:
      return SubscriptionStatus.Active;
  }
}
