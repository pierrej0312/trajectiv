import { UserStatus } from '../enums/user-status.enum';
import { AiCreditWallet } from './ai-credit-wallet.model';
import { MeOnboarding } from './me-onboarding.model';
import { Subscription } from './subscription.model';
import { UserProfile } from './user-profile.model';

export interface Me {
  id: string;
  keycloakSubject: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  avatarUrl: string | null;
  status: UserStatus;
  onboarding: MeOnboarding;
  profile: UserProfile;
  subscription: Subscription;
  credits: AiCreditWallet;
}
