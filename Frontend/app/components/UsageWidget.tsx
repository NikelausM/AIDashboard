import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AI_BACKEND_API_BASE_URL } from "~/constants/urls";
import { AggregatePeriod, enumAggregatePeriodsStringArray, type Usage } from "../../types/Usage";
import { CardContent, Divider, Card, CardHeader, TextField, AccordionDetails, AccordionSummary, Accordion, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getPeriodDescription, getShortPeriodDescription } from "~/utils/dataUtils";
import { BarChart, LineChart } from "@mui/x-charts";

export default function UsageWidget({ initialTeamId, initialUsageData }: { initialTeamId?: number, initialUsageData?: Usage[] }) {
  const [teamId, setTeamId] = React.useState(initialTeamId ?? "");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Usage[] | null>(initialUsageData ?? null);
  const [error, setError] = React.useState<string | null>(null);

  const [periodType, setPeriodType] = React.useState<
    "aggregate" | "range"
  >("aggregate");
  const initialWeekUsageData = data?.filter(entry => !enumAggregatePeriodsStringArray.includes(entry.period));
  const [startWeek, setStartWeek] = React.useState(initialWeekUsageData && initialWeekUsageData.length > 0 ? initialWeekUsageData[0].period : "");
  const [endWeek, setEndWeek] = React.useState(initialWeekUsageData && initialWeekUsageData.length > 0 ? initialWeekUsageData[initialWeekUsageData.length - 1].period : "");

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const start = performance.now();
    const minDuration = 2000;

    try {
      const response = await fetch(`${AI_BACKEND_API_BASE_URL}/${teamId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json: Usage[] = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      const elapsed = performance.now() - start;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    }
  };

  const weekOptions =
    data
      ?.filter((usageEntry) =>
        /^year-\d{4}-week-\d{1,2}$/.test(usageEntry.period)
      )
      .map((usageEntry) => ({
        value: usageEntry.period,
        label: getPeriodDescription(usageEntry.period),
      })) ?? [];

  let filteredUsage: Usage[] = data ?? [];

  if (periodType === "aggregate") {
    filteredUsage = filteredUsage.filter((usageEntry) =>
      [AggregatePeriod.Last7Days, AggregatePeriod.LastMonth, AggregatePeriod.Last3Months, AggregatePeriod.LastYear]
        .map(val => val.toString())
        .includes(
          usageEntry.period
        )
    );
  }

  if (periodType === "range" && startWeek && endWeek) {
    const startIndex = filteredUsage.findIndex(
      (entry) => entry.period === startWeek
    );
    const endIndex = filteredUsage.findIndex(
      (entry) => entry.period === endWeek
    );

    if (startIndex !== -1 && endIndex !== -1) {
      const [low, high] = [
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex),
      ];
      filteredUsage = filteredUsage.slice(low, high + 1);
    } else {
      filteredUsage = [];
    }
  }

  /**
   * Calculates the trend line.
   * 
   * @param values The values
   * @returns The trend line values.
   */
  function calculateTrendLine(values: number[]): number[] {
    const n = values.length;
    if (n === 0) {
      return [];
    }

    const x = values.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      return [...y];
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return x.map((xi) => slope * xi + intercept);
  }

  const estimatedCosts = filteredUsage.map(entry => entry.estimatedCost);
  const estimatedCostTrendLineValues = calculateTrendLine(estimatedCosts);
  const minAllEstimatedCostValues = Math.min(...estimatedCosts, ...estimatedCostTrendLineValues);

  const uniqueTopModelNames = Array.from(
    new Set(
      filteredUsage.flatMap((entry) =>
        entry.topModels.map((model) => model.name)
      )
    )
  );

  const colorPalette = ["#0073e6", "#e6308A", "#009eb0", "#c44601", "#029356" ]

  function getPaletteColorsForLength(length: number, colorPalette: string[]): string[] {
    const colors: string[] = [];
    const availableColors = ["red", "cyan", "blue"];

    for (let i = 0; i < length; i++) {
      colors.push(availableColors[availableColors.length % i]);
    }

    return colors;
  }

  const topModelColors: Record<string, string> = {};

  const palette = getPaletteColorsForLength(uniqueTopModelNames.length, colorPalette);

  const displayData =
    filteredUsage?.map((entry, index) => ({
      id: index,
      x: index,
      totalCalls: entry.totalCalls,
      tokensConsumed: entry.tokensConsumed,
      estimatedCost: entry.estimatedCost,
      topModels: entry.topModels,
      periodDescription: getPeriodDescription(entry.period),
      shortPeriodDescription: getShortPeriodDescription(entry.period)
    })) ?? [];

  
  const periodDescriptions = new Array(displayData.length);
  const shortPeriodDescriptions = new Array(displayData.length);
  for (const entryIdx in displayData) {
    const entry = displayData[entryIdx];
    periodDescriptions[entryIdx] = entry.periodDescription;
    shortPeriodDescriptions[entryIdx] = entry.shortPeriodDescription;
  }

  const periodXAxisLabel = periodType == "aggregate" ? "Period" : "Period (weeks)"

  const topModelSeries = uniqueTopModelNames.map((name, index) => {
    return {
      label: name,
      data: displayData.map((point) => point.topModels.filter(entry => entry.name === name)[0].calls),
      color: topModelColors[name] = palette[index],
    }
  });

  let colorPaletteIdx = 0;

  return (
    <Box sx={{ width: "100%", mx: "auto", p: 2 }}>
      <Card sx={{ width: "100%", mb: 4 }}>
        <CardHeader
          title="Usage Metrics"
          aria-label="Usage"
          subheader="View API usage by team"
          sx={{ pb: 0 }}
        />

        <Divider />

        <Box sx={{p: 2}}>
          <form onSubmit={handleSubmit}>
            <TextField
              id="teamId"
              label="Team ID"
              aria-label="Team ID"
              variant="filled"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value as string)}
              sx={{ 
                mb: 2, 
                width: 200,
              }}
            />

            <Box sx={{ mb: 2 }}>
              <FormControl sx={{ mb: 3 }}>
                <FormLabel id="period-type-label">Select Period Type</FormLabel>
                <RadioGroup
                  row
                  value={periodType}
                  aria-labelledby="period-type-label"
                  onChange={(e) =>
                    setPeriodType(e.target.value as "aggregate" | "range")
                  }
                >
                  <FormControlLabel
                    value="aggregate"
                    control={<Radio />}
                    label="Aggregate Period"
                    aria-label="Aggregate period"
                  />
                  <FormControlLabel
                    value="range"
                    control={<Radio />}
                    label="Date Range"
                    aria-label="Date range"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {periodType === "range" && (
              <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                <FormControl sx={{ width: 200 }}>
                  <FormLabel id="start-week-label">Start Week</FormLabel>
                  <Select
                    value={startWeek}
                    aria-labelledby="start-week-label"
                    onChange={(e) => setStartWeek(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select Start</em>
                    </MenuItem>
                    {weekOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ width: 200 }}>
                  <FormLabel id="end-week-label">End Week</FormLabel>
                  <Select
                    value={endWeek}
                    aria-labelledby="end-week-label"
                    onChange={(e) => setEndWeek(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select End</em>
                    </MenuItem>
                    {weekOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={30} />
              </Box>
            )}

            {error && !loading && (
              <Typography color="error" sx={{ my: 2 }}>
                Error: There was a problem getting the usage data
              </Typography>
            )}

            <Button variant="contained" type="submit" disabled={loading} aria-label="Submit form info and load usage data">
              {loading ? "Loading…" : "Submit"}
            </Button>
          </form>

          {!error && !loading && data && (
            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />} 
                id="raw-data-header"
                aria-controls="raw-data-content">
                <Typography variant="subtitle1" fontWeight={600}>
                  Raw Data
                </Typography>
              </AccordionSummary>

              <AccordionDetails id="raw-data-content">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  <code>{JSON.stringify(data, null, 4)}</code>
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </Card>

      {data && !error && !loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gridAutoRows: "500px",
            gap: 4,
          }}
        >
          {displayData.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ mt: 2, fontStyle: "italic", textAlign: "center" }}
            >
              No usage data available to display.
            </Typography>
          ) : (
            <>
              <Card sx={{ gridColumn: "1 / -1", height: "100%"}}>
                <CardHeader title="Top Models Usage Over Time" sx={{ height: "20%" }}/>
                <CardContent sx={{ height: "80%" }}>
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: periodType == "aggregate" ? periodDescriptions : shortPeriodDescriptions,
                        label: periodXAxisLabel,
                        tickLabelPlacement: "middle",
                        tickPlacement: "middle",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Calls",
                        min: 0,
                      },
                    ]}
                    aria-label="Top models usage over time"
                    series={topModelSeries}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Total Calls" sx={{ height: "20%" }} />
                <CardContent sx={{ height: "80%" }}>
                <LineChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: periodType == "aggregate" ? periodDescriptions : shortPeriodDescriptions,
                      label: periodXAxisLabel,
                      tickLabelPlacement: "middle",
                      tickPlacement: "middle",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Total Calls",
                      min: 0,
                    },
                  ]}
                  aria-label="Total calls"
                  series={[
                    {
                      label: "Total Calls",
                      data: displayData.map((point) => point.totalCalls),
                      color: colorPalette[colorPalette.length % colorPaletteIdx++],
                    },
                  ]}
                />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Tokens Consumed" sx={{ height: "20%" }} />
                <CardContent sx={{ height: "80%" }}>
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: periodType == "aggregate" ? periodDescriptions : shortPeriodDescriptions,
                        label: periodXAxisLabel,
                        tickLabelPlacement: "middle",
                        tickPlacement: "middle",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Tokens Consumed",
                        min: 0,
                      },
                    ]}
                    aria-label="Tokens consumed"
                    series={[
                      {
                        label: "Tokens Consumed",
                        data: displayData.map((point) => point.tokensConsumed),
                        color: colorPalette[1],
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Estimated Cost" sx={{ height: "20%" }} />
                <CardContent sx={{ height: "80%" }}>
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: periodType == "aggregate" ? periodDescriptions : shortPeriodDescriptions,
                        label: periodXAxisLabel,
                        tickLabelPlacement: "middle",
                        tickPlacement: "middle",
                      },
                    ]}
                    yAxis={[
                      {
                        id: "cost",
                        label: "Estimated Cost ($)",
                        min: minAllEstimatedCostValues
                      },
                      { 
                        id: "trend", 
                        label: "Trend", 
                        min: minAllEstimatedCostValues
                      }
                    ]}
                    aria-label="Estimated cost"
                    series={[
                      {
                        label: "Estimated Cost ($)",
                        yAxisId: "cost",
                        data: displayData.map((p) => p.estimatedCost),
                        color: colorPalette[0],
                      },
                      {
                        label: "Estimated Cost Trend",
                        yAxisId: "trend",
                        data: estimatedCostTrendLineValues,
                        color: colorPalette[3],
                        curve: "linear",
                        showMark: false,
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}