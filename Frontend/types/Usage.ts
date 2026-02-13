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
}

export const enumAggregatePeriodsArray = Object.values(AggregatePeriod);

export const enumAggregatePeriodsStringArray = Object.values(AggregatePeriod).map(val => val.toString());

export function isAggregatePeriod(value: unknown): value is AggregatePeriod {
  return enumAggregatePeriodsArray.includes(value as AggregatePeriod);
}