import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AI_BACKEND_API_BASE_URL } from "~/constants/urls";
import { periodTypeToDescriptionMap, type Usage } from "../../types/Usage";
import { CardContent, Divider, Card, CardHeader, TextField, AccordionDetails, AccordionSummary, Accordion } from "@mui/material";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function UsageWidget({ initialTeamId, initialUsageData }: { initialTeamId?: number, initialUsageData?: Usage[] }) {
  const [teamId, setTeamId] = React.useState(initialTeamId ?? "");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Usage[] | null>(initialUsageData ?? null);
  const [error, setError] = React.useState<string | null>(null);

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

  const scatterPoints =
    data?.map((u, index) => ({
      id: index,
      x: index, // ordinal index for x-axis
      y: u.totalCalls,
      period: periodTypeToDescriptionMap[u.period] ?? "",
    })) ?? [];

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

          {loading && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={30} />
            </Box>
          )}

          {data && !loading && (
            <Box sx={{ mt: 4 }}>
              {scatterPoints.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{ mt: 2, fontStyle: "italic", textAlign: "center" }}
                >
                  No usage data available to display.
                </Typography>
              ) : (
                <ScatterChart
                  width={600}
                  height={400}
                  margin={{ top: 20, right: 40, bottom: 40, left: 60 }}
                  series={[
                    {
                      label: "Total Calls",
                      data: scatterPoints,
                    },
                  ]}
                  xAxis={[
                    {
                      label: "Period",
                      data: scatterPoints.map((point) => point.x),
                      valueFormatter: (index: number) =>
                        scatterPoints[index]?.period ?? "",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Total Calls",
                      min: 0,
                    },
                  ]}
                />
              )}
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ my: 2 }}>
              Error: There was a problem getting the usage data
            </Typography>
          )}

          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Submit"}
          </Button>
        </form>

      {!error && data && (
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