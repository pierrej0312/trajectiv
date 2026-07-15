const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function daysUntilLocalDate(isoDate: string, today: Date = new Date()): number | null {
  const match = ISO_LOCAL_DATE_PATTERN.exec(isoDate);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  const targetUtc = Date.UTC(year, month - 1, day);

  const targetDate = new Date(targetUtc);

  if (
    targetDate.getUTCFullYear() !== year ||
    targetDate.getUTCMonth() !== month - 1 ||
    targetDate.getUTCDate() !== day
  ) {
    return null;
  }

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.max(0, Math.ceil((targetUtc - todayUtc) / MILLISECONDS_PER_DAY));
}

export function buildRenewalLabel(days: number | null): string | null {
  if (days === null) {
    return null;
  }

  if (days === 0) {
    return 'Renouvellement aujourd’hui';
  }

  if (days === 1) {
    return 'Renouvellement demain';
  }

  return `Renouvellement dans ${days} jours`;
}
