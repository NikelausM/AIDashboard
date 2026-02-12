import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import UsageWidget from '~/components/UsageWidget';
import { AI_BACKEND_API_BASE_URL } from '~/constants/urls';
import {Period, type Usage } from '../../types/Usage';

export function meta() {
  return [
    { title: 'AI Dashboard' },
    {
      name: 'description',
      content: 'A a dashboard widget that displays AI platform usage metrics for a team.',
    },
  ];
}

const initialTeamId = 101;

/**
 * Fetches data asynchronously in parallel with page load.
 * @returns The initial data for the page.
 */
export async function loader(args: LoaderFunctionArgs): Promise<Usage[]> {
  const response = await fetch(`${AI_BACKEND_API_BASE_URL}/${initialTeamId}`);
  return response.json();
}

export default function Home() {
  const initialData = useLoaderData();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <UsageWidget initialTeamId={initialTeamId} initialUsageData={initialData}/>
      </Box>
    </Container>
  );
}
