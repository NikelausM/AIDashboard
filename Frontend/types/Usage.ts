export interface Usage {
  teamId: number,
  totalCalls: number,
  tokensConsumed: number,
  estimatedCost: number,
  topModels: [
    name: string,
    calls: number
  ],
  period: AggregatePeriod | string
}

export enum AggregatePeriod {
  Last7Days = "last_7_days",
  LastMonth = "last_month",
  Last3Months = "last_3_months",
  LastYear = "last_year",
  All = "all"
}

export function isAggregatePeriod(value: unknown): value is AggregatePeriod {
  return Object.values(AggregatePeriod).includes(value as AggregatePeriod);
}