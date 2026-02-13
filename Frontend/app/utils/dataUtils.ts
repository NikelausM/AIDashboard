import { AggregatePeriod, isAggregatePeriod } from "../../types/Usage";

const aggregatePeriodTypeToDescriptionMap = {
  [AggregatePeriod.Last7Days]: "Last 7 Days",
  [AggregatePeriod.LastMonth]: "Last Month",
  [AggregatePeriod.Last3Months]: "Last 3 Months",
  [AggregatePeriod.LastYear]: "Last Year",
  [AggregatePeriod.All]: "All Time",
}

export function getPeriodDescription(periodCode: string) {
  let description = "";

  if (isAggregatePeriod(periodCode)) {
    description = aggregatePeriodTypeToDescriptionMap[periodCode];
  } else if (/^year-\d+-week-\d+$/.test(periodCode)) {
    const parts = periodCode.split("-");
    const yearNumber = parts[1];
    const weekNumber = parts[parts.length - 1]; // safe, correct
    description = `Year ${yearNumber}, Week ${weekNumber}`
  } else {
    description = periodCode;
  }

  return description;

}