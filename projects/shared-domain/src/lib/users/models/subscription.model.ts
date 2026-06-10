import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}
