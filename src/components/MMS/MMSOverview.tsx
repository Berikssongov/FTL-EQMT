import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";

const MMSOverview: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        🏢 Maintenance Management System (MMS)
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This section is under active development. Soon, you'll be able to manage and track:
        </Typography>
        <ul>
          <li><strong>Assets:</strong> Buildings, zones, and structures across the site</li>
          <li><strong>Components:</strong> Elements like windows, doors, handrails, siding, etc.</li>
          <li><strong>Inspections & Maintenance:</strong> Logs of past work and future schedules</li>
        </ul>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="textSecondary">
          You can start by viewing the Assets section from the navigation bar. New features will appear here as they are developed.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MMSOverview;
