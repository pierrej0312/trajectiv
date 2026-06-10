import { OnboardingMissingField } from '../enums/onboarding-missing-field.enum';
import { OnboardingStatus } from '../enums/onboarding-status.enum';

export interface MeOnboarding {
  status: OnboardingStatus;
  completedAt: Date | null;
  missingFields: OnboardingMissingField[];
}
