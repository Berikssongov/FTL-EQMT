// src/components/MMS/MMSOverview.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { useRole } from "../../contexts/RoleContext";

import AssetList from "./Assets/AssetList";
import ComponentList from "./Components/ComponentList";
import InspectionOverview from "./Inspections/InspectionOverview"; 
import PlanningOverview from "./Planning/PlanningOverview";


const MMSOverview: React.FC = () => {
  const { role } = useRole();
  const [tab, setTab] = useState(0);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(null);

  if (role !== "admin") {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", py: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          🚧 MMS Under Construction
        </Typography>
        <Typography variant="body1">
          This section is currently being developed. Please check back soon for new features related to assets, inspections, and maintenance tracking.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom align="center">
        🛠 Maintenance Management System
      </Typography>


      {/* Tabs Navigation */}
      <Box sx={{ maxWidth: 700, mx: "auto", mb: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
          textColor="primary"
          indicatorColor="primary">
          <Tab label="Inventory" />
          <Tab label="Inspections" />
          <Tab label="Planning" />
          <Tab label="Work Orders" />
          <Tab label="Reports" />
        </Tabs>
      </Paper>
      </Box>

      {/* Tab Panels */}
      {tab === 0 && (
        <Box>
          <AssetList />
          {selectedAssetId && (
            <ComponentList
              assetId={selectedAssetId}
              assetName={selectedAssetName || ""}
            />
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            📋 Inspections
          </Typography>
          <InspectionOverview /> {/* ✅ replaces placeholder */}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            📝 Planning
          </Typography>
          <PlanningOverview />
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            🔧 Work Orders
          </Typography>
          <Typography>
            Track active and completed work orders here (coming soon).
          </Typography>
        </Box>
      )}

      {tab === 4 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            📊 Reports
          </Typography>
          <Typography>
            Cost estimates, performance, and review of past maintenance (coming soon).
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MMSOverview;
