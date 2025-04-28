// src/components/DashboardHome.tsx
import React from "react";
import { Box, Grid, Paper, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Equipment by Location */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Equipment by Location
        </Typography>
        {/* TODO: Add Equipment Table */}
        <Typography color="textSecondary">
          Equipment table will go here...
        </Typography>
      </Paper>

      {/* Overdue Service + Damaged Equipment side-by-side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} {...({} as any)}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Overdue Service
            </Typography>
            {/* TODO: Add Overdue Service List */}
            <Typography color="textSecondary">
              Overdue equipment will go here...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} {...({} as any)}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Damaged Equipment
            </Typography>
            {/* TODO: Add Damaged Equipment List */}
            <Typography color="textSecondary">
              Damaged equipment will go here...
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tools Section */}
      <Grid container spacing={3} sx={{ mb: 3 }} {...({} as any)}>
        <Grid item xs={12} md={6} {...({} as any)}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Hand Tools
            </Typography>
            {/* TODO: Add Hand Tools List */}
            <Typography color="textSecondary">
              Hand tools list will go here...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} {...({} as any)}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Power Tools
            </Typography>
            {/* TODO: Add Power Tools List */}
            <Typography color="textSecondary">
              Power tools list will go here...
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => navigate("/equipment")}>
            View Equipment
          </Button>
          <Button variant="contained" onClick={() => {}}>
            Add Equipment
          </Button>
          <Button variant="contained" onClick={() => {}}>
            Add Service Record
          </Button>
          <Button variant="contained" onClick={() => {}}>
            Add Tool
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DashboardHome;
