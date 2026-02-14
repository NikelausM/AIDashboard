import * as React from 'react';
import Box from '@mui/material/Box';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import UsageWidget from '~/components/UsageWidget';
import { AI_BACKEND_API_BASE_URL } from '~/constants/urls';
import { type Usage } from '../../types/Usage';
import { AppBar, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { aiUsageClient } from '~/root';

export function meta() {
  return [
    { title: 'AI Dashboard' },
    {
      name: 'description',
      content: 'A a dashboard widget that displays AI platform usage metrics for a team.',
    },
  ];
}

const drawerWidth = 240;
const initialTeamId = 101;

/**
 * Fetches data asynchronously in parallel with page load.
 * @returns The initial data for the page.
 */
export async function loader(args: LoaderFunctionArgs): Promise<Usage[]> {
  const usages = await aiUsageClient.getUsage(initialTeamId);
  return usages;
}

export default function Home() {
  const initialData = useLoaderData();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            AI Usage Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Usage Metrics" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />

        <UsageWidget
          initialTeamId={initialTeamId}
          initialUsageData={initialData}
        />
      </Box>
    </Box>
  );
}
