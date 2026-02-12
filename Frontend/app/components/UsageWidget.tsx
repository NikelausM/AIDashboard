// app/components/UsageWidget.tsx
import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { AI_BACKEND_API_BASE_URL } from "~/constants/urls";
import type { Usage } from "../../types/Usage";

export default function UsageWidget({ initialPeriod, initialUsageData }: { initialPeriod?: string, initialUsageData?: Usage[] }) {
  const [period, setPeriod] = React.useState(initialPeriod ?? "");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Usage[] | null>(initialUsageData ?? null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_BACKEND_API_BASE_URL}?period=${period}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json: Usage[] = await response.json();
      
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Usage Metrics
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="period-label">Period</InputLabel>
          <Select
            labelId="period-label"
            id="period"
            name="period"
            value={period}
            label="Period"
            onChange={(e: SelectChangeEvent) =>
              setPeriod(e.target.value as string)
            }
          >
            <MenuItem value="last_7_days">Last 7 Days</MenuItem>
            <MenuItem value="last_month">Last Month</MenuItem>
            <MenuItem value="last_3_months">Last 3 Months</MenuItem>
            <MenuItem value="last_year">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
            {/* uncomment next line to simulate an error */}
            {/* <MenuItem value="simulate_error">Simulate Error</MenuItem> */}
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "rgba(255,255,255,0.8)" }} />
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

      <pre>
        <code>{JSON.stringify(data, null, 4)}</code>
      </pre>
    </div>
  );
}