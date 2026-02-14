export interface Usage {
  teamId: number,
  totalCalls: number,
  tokensConsumed: number,
  estimatedCost: number,
  topModels:
  {
    name: string,
    calls: number
  }[],
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

export function isUsage(value: unknown): value is Usage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value;

  if (!("teamId" in obj) || typeof obj.teamId !== "number") {
    return false;
  }

  if (!("totalCalls" in obj) || typeof obj.totalCalls !== "number") {
    return false;
  }

  if (!("tokensConsumed" in obj) || typeof obj.tokensConsumed !== "number") {
    return false;
  }

  if (!("estimatedCost" in obj) || typeof obj.estimatedCost !== "number") {
    return false;
  }

  if (!("period" in obj)) {
    return false;
  }

  const period = obj.period;
  const isEnum = enumAggregatePeriodsArray.includes(period as AggregatePeriod);

  if (!(typeof period === "string" || isEnum)) {
    return false;
  }

  if (!("topModels" in obj) || !Array.isArray(obj.topModels)) {
    return false;
  }

  for (const model of obj.topModels) {
    if (typeof model !== "object" || model === null) {
      return false;
    }

    if (!("name" in model) || typeof model.name !== "string") {
      return false;
    }

    if (!("calls" in model) || typeof model.calls !== "number") {
      return false;
    }
  }

  return true;
}

