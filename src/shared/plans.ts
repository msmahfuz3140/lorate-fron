/**
 * Authoritative 5 Subscription Plans for the Roulette Prediction Platform
 * As defined in Section 7 of the Project Specification:
 * 1. 15 Days — $150 (15,000 cents)
 * 2. 1 Month — $200 (20,000 cents)
 * 3. 3 Months — $450 (45,000 cents)
 * 4. 6 Months — $700 (70,000 cents)
 * 5. 1 Year — $1,000 (100,000 cents)
 */

export type DurationUnit = 'DAYS' | 'MONTHS';

export interface PlanDuration {
  unit: DurationUnit;
  value: number; // e.g. 15 for 15 Days, 1 for 1 Month, 3 for 3 Months, 6 for 6 Months, 12 for 1 Year
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  priceUsd: number;        // In USD dollars (for display, derived from priceCents / 100)
  priceCents: number;      // Decimal-safe integer cents (15000 = $150.00, no floating-point inaccuracies)
  duration: PlanDuration;  // Explicit duration representation
  durationDays: number;    // Reference day count
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  isVisible: boolean;
  displayOrder?: number;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  PLAN_15_DAYS: {
    id: 'PLAN_15_DAYS',
    name: '15 Days Pass',
    badge: 'STARTER',
    description: '15 calendar days full live access to European Roulette prediction feeds across 20+ tables.',
    priceUsd: 150,
    priceCents: 15000,
    duration: { unit: 'DAYS', value: 15 },
    durationDays: 15,
    features: [
      'Access to 20+ Evolution & Pragmatic live tables',
      'Real-time live spin tracking',
      'Offset Strategy prediction metrics',
      'Pocket distance (0-3) indicators',
      'Real-time hot streak alerts',
      'Telegram community support'
    ],
    isActive: true,
    isVisible: true
  },
  PLAN_1_MONTH: {
    id: 'PLAN_1_MONTH',
    name: '1 Month Pro',
    badge: 'MOST POPULAR',
    isPopular: true,
    description: '1 full calendar month algorithmic coverage for disciplined session profitability.',
    priceUsd: 200,
    priceCents: 20000,
    duration: { unit: 'MONTHS', value: 1 },
    durationDays: 30,
    features: [
      'All 15 Days Pass features',
      'Target Strategy pattern recognition',
      'Win/Loss streak tracking (W/L sequences)',
      'Momentum weakening exit signals',
      'Real-time hot table detection',
      'Priority Telegram support'
    ],
    isActive: true,
    isVisible: true
  },
  PLAN_3_MONTHS: {
    id: 'PLAN_3_MONTHS',
    name: '3 Months Master',
    badge: 'VALUE',
    description: '3 full calendar months continuous access with enhanced volatility filters and dealer telemetry.',
    priceUsd: 450,
    priceCents: 45000,
    duration: { unit: 'MONTHS', value: 3 },
    durationDays: 90,
    features: [
      'All 1 Month Pro features',
      'Dealer Signature Strategy unlocked',
      'Ball travel line (Over/Under) triggers',
      'TOP number placements (e.g. 0n4)',
      'Multi-table simultaneous surveillance',
      'VIP Telegram channel access'
    ],
    isActive: true,
    isVisible: true
  },
  PLAN_6_MONTHS: {
    id: 'PLAN_6_MONTHS',
    name: '6 Months Elite',
    badge: 'HIGH ROLLER',
    description: '6 full calendar months high-volume subscription designed for advanced systematic players.',
    priceUsd: 700,
    priceCents: 70000,
    duration: { unit: 'MONTHS', value: 6 },
    durationDays: 180,
    features: [
      'All 3 Months Master features',
      'Deep historical archive telemetry',
      'Croupier rhythm phase analysis',
      'Direct 1-on-1 strategy onboarding',
      'Early access to new experimental models',
      'Dedicated support manager'
    ],
    isActive: true,
    isVisible: true
  },
  PLAN_1_YEAR: {
    id: 'PLAN_1_YEAR',
    name: '1 Year VIP Annual',
    badge: 'MAXIMUM SAVINGS',
    description: '12 full calendar months (1 year) unlimited VIP access at the lowest effective daily rate.',
    priceUsd: 1000,
    priceCents: 100000,
    duration: { unit: 'MONTHS', value: 12 },
    durationDays: 365,
    features: [
      'Permanent 365-day access to all prediction tools',
      'All current and future algorithmic strategies',
      'Ultra-low latency private prediction stream',
      'Direct 1-on-1 founder support desk',
      'Exclusive high-roller inner circle',
      'Guaranteed 24/7 uptime SLA'
    ],
    isActive: true,
    isVisible: true
  }
};

export const PLANS_ARRAY: SubscriptionPlan[] = Object.values(SUBSCRIPTION_PLANS);

export const MODERATOR_COMMISSION_RATE = 0.50; // 50% referral commission for moderators

/**
 * Returns the exact days in a given month of a given year,
 * correctly handling 28/29 days in February for leap years.
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Accurately calculates subscription expiration dates.
 * Handles calendar-month boundary conditions and leap-year edge cases.
 * E.g., Jan 31 + 1 month in non-leap year -> Feb 28.
 * E.g., Jan 31 + 1 month in leap year (2028) -> Feb 29.
 */
export function calculatePlanExpiration(startDate: Date, duration: PlanDuration): Date {
  const result = new Date(startDate.getTime());

  if (duration.unit === 'DAYS') {
    result.setTime(result.getTime() + duration.value * 24 * 60 * 60 * 1000);
    return result;
  }

  // Unit: MONTHS
  // Using UTC methods avoids timezone and daylight saving time variance
  const currentDay = result.getUTCDate();
  const currentMonth = result.getUTCMonth();
  const currentYear = result.getUTCFullYear();

  const totalMonths = currentMonth + duration.value;
  const targetYear = currentYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  const maxDaysInTarget = getDaysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(currentDay, maxDaysInTarget);

  // Set date to 1 first to prevent intermediate month rollover
  result.setUTCDate(1);
  result.setUTCFullYear(targetYear);
  result.setUTCMonth(targetMonth);
  result.setUTCDate(targetDay);

  return result;
}

/**
 * Converts integer cents to formatted USD currency display.
 * Prevents floating-point precision artifacts (e.g. 15000 -> "$150").
 */
export function formatCentsToUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const remainderCents = cents % 100;
  if (remainderCents === 0) {
    return `$${dollars.toLocaleString('en-US')}`;
  }
  return `$${dollars.toLocaleString('en-US')}.${remainderCents.toString().padStart(2, '0')}`;
}

export interface UpdatePlanInput {
  name?: string;
  badge?: string;
  description?: string;
  priceCents?: number;
  durationUnit?: 'DAYS' | 'MONTHS';
  durationValue?: number;
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface CreatePlanInput {
  id?: string;
  name: string;
  badge?: string;
  description: string;
  priceCents: number;
  durationUnit: 'DAYS' | 'MONTHS';
  durationValue: number;
  features: string[];
  isPopular?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
  displayOrder?: number;
}

