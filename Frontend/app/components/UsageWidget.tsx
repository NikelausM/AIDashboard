import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AI_BACKEND_API_BASE_URL } from "~/constants/urls";
import { AggregatePeriod, enumAggregatePeriodsStringArray, type Usage } from "../../types/Usage";
import { CardContent, Divider, Card, CardHeader, TextField, AccordionDetails, AccordionSummary, Accordion, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getPeriodDescription } from "~/utils/dataUtils";
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
  const [startWeek, setStartWeek] = React.useState(initialWeekUsageData ? initialWeekUsageData[0].period : "");
  const [endWeek, setEndWeek] = React.useState(initialWeekUsageData ? initialWeekUsageData[initialWeekUsageData.length - 1].period : "");

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

  const uniqueTopModelNames = Array.from(
    new Set(
      filteredUsage.flatMap((entry) =>
        entry.topModels.map((model) => model.name)
      )
    )
  );

  function getPrimaryColors(count: number): string[] {
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i);
      colors.push(`hsl(${hue}, 90%, 50%)`);
    }

    return colors;
  }

  const topModelColors: Record<string, string> = {};

  const palette = getPrimaryColors(uniqueTopModelNames.length);

  const displayData =
    filteredUsage?.map((entry, index) => ({
      id: index,
      x: index,
      totalCalls: entry.totalCalls,
      tokensConsumed: entry.tokensConsumed,
      estimatedCost: entry.estimatedCost,
      topModels: entry.topModels,
      period: getPeriodDescription(entry.period),
    })) ?? [];

  const topModelSeries = uniqueTopModelNames.map((name, index) => {
    return {
      label: `${name} vs. Period`,
      data: displayData.map((point) => point.topModels.filter(entry => entry.name === name)[0].calls),
      color: topModelColors[name] = palette[index],
    }
  });

  return (
    <Card sx={{ width: "100%", maxWidth: 1100, mx: "auto", p: 2 }}>
      <CardHeader
        title="Usage Metrics"
        subheader="View API usage by team"
        sx={{ pb: 0 }}
      />

      <Divider />

      <CardContent>
        <form onSubmit={handleSubmit}>
          <TextField
            id="teamId"
            label="Team ID"
            variant="filled"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value as string)}
            sx={{ mb: 2, width: 200 }}
          />

          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Select Period Type</FormLabel>
              <RadioGroup
                row
                value={periodType}
                onChange={(e) =>
                  setPeriodType(e.target.value as "aggregate" | "range")
                }
              >
                <FormControlLabel
                  value="aggregate"
                  control={<Radio />}
                  label="Aggregate Period"
                />
                <FormControlLabel
                  value="range"
                  control={<Radio />}
                  label="Date Range"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {periodType === "range" && (
            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <FormControl sx={{ width: 200 }}>
                <FormLabel>Start Week</FormLabel>
                <Select
                  value={startWeek}
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
                <FormLabel>End Week</FormLabel>
                <Select
                  value={endWeek}
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

          {data && !error && !loading && (
            <Box sx={{ mt: 4 }}>
              {displayData.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{ mt: 2, fontStyle: "italic", textAlign: "center" }}
                >
                  No usage data available to display.
                </Typography>
              ) : (
                <div>
                  <LineChart
                    width={900}
                    height={400}
                    margin={{ top: 20, right: 60, bottom: 100, left: 60 }}
                    xAxis={[
                      {
                        scaleType: "band",
                        data: displayData.map((point) => point.period),
                        label: "Period",
                        tickLabelPlacement: "middle",
                        tickPlacement: "end",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Total Calls",
                        min: 0,
                      },
                    ]}
                    series={[
                      {
                        label: "Total Calls vs. Period",
                        data: displayData.map((point) => point.totalCalls),
                        color: "#1976d2",
                      },
                    ]}
                  />

                <LineChart
                  width={900}
                  height={400}
                  margin={{ top: 20, right: 60, bottom: 100, left: 60 }}
                  xAxis={[
                    {
                      scaleType: "band",
                      data: displayData.map((point) => point.period),
                      label: "Period",
                      tickLabelPlacement: "middle",
                      tickPlacement: "end",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Tokens Consumed",
                      min: 0,
                    },
                  ]}
                  series={[
                    {
                      label: "Tokens Consumed vs. Period",
                      data: displayData.map((point) => point.tokensConsumed),
                      color: "yellow",
                    },
                  ]}
                />

                <LineChart
                  width={900}
                  height={400}
                  margin={{ top: 20, right: 60, bottom: 100, left: 60 }}
                  xAxis={[
                    {
                      scaleType: "band",
                      data: displayData.map((point) => point.period),
                      label: "Period",
                      tickLabelPlacement: "middle",
                      tickPlacement: "end",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Estimated Cost ($)",
                      min: 0,
                    },
                  ]}
                  series={[
                    {
                      label: "Estimated Cost ($) vs. Period",
                      data: displayData.map((point) => point.estimatedCost),
                      color: "orange",
                    },
                  ]}
                />

                <BarChart
                  width={900}
                  height={400}
                  margin={{ top: 20, right: 60, bottom: 100, left: 60 }}
                  xAxis={[
                    {
                      scaleType: "band",
                      data: displayData.map((point) => point.period),
                      label: "Period",
                      tickLabelPlacement: "middle",
                      tickPlacement: "end",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Top Models",
                      min: 0,
                    },
                  ]}
                  series={topModelSeries}
                />
                </div>
              )}
            </Box>
          )}

          {error && !loading && (
            <Typography color="error" sx={{ my: 2 }}>
              Error: There was a problem getting the usage data
            </Typography>
          )}

          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Submit"}
          </Button>
        </form>

      {!error && !loading && data && (
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Raw Data
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              <code>{JSON.stringify(data, null, 4)}</code>
            </pre>
          </AccordionDetails>
        </Accordion>
      )}

      </CardContent>
    </Card>
  );

}