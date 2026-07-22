export function getSubscriptionPlanLabel(planCode: string | null | undefined): string {
  switch (planCode) {
    case 'FREE':
      return 'Free';

    case 'PREMIUM':
      return 'Premium';

    case 'PRO':
      return 'Pro';

    case 'BUSINESS':
      return 'Business';

    case null:
    case undefined:
    case '':
      return 'Free';

    default:
      return planCode;
  }
}
