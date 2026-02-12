export interface Usage {
  teamId: number,
  totalCalls: number,
  tokensConsumed: number,
  estimatedCost: number,
  topModels: [
    name: string,
    calls: number
  ],
  period: Period
}

export enum Period {
  Last7Days = "last_7_days",
  LastMonth = "last_month",
  Last3Months = "last_3_months",
  LastYear = "last_year",
  All = "all"
}

export function isPeriod(value: unknown): value is Period {
  console.log("value: ", value);
  console.log(Object.values(Period))
  return Object.values(Period).includes(value as Period);
}

export const periodTypeToDescriptionMap = {
  [Period.Last7Days]: "Last 7 Days",
  [Period.LastMonth]: "Last Month",
  [Period.Last3Months]: "Last 3 Months",
  [Period.LastYear]: "Last Year",
  [Period.All]: "All Time",
}