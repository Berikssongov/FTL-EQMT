// src/components/MMS/MMSOverview.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { useRole } from "../../contexts/RoleContext";
import { useLocation, useNavigate } from "react-router-dom";

import AssetList from "./Assets/AssetList";
import ComponentList from "./Components/ComponentList";
import InspectionOverview from "./Inspections/InspectionOverview";
import PlanningOverview from "./Planning/PlanningOverview";
import WorkOrdersPage from "./Work Orders/WorkOrdersPage";

// Map tabs to hash values for navigation
const tabMap: Record<string, number> = {
  inventory: 0,
  inspections: 1,
  planning: 2,
  workorders: 3,
  reports: 4,
};

const reverseTabMap = Object.fromEntries(
  Object.entries(tabMap).map(([key, val]) => [val, key])
);

const MMSOverview: React.FC = () => {
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Default to inventory if no hash
  const initialTab =
    tabMap[location.hash.replace("#", "")] ?? tabMap.inventory;
  const [tab, setTab] = useState(initialTab);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(null);

  // Sync tab state with hash changes (when user navigates or presses back/forward)
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (tabMap[hash] !== undefined) {
      setTab(tabMap[hash]);
    }
  }, [location.hash]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    const tabKey = reverseTabMap[newValue];
    navigate(`/mms#${tabKey}`);
  };

  if (role !== "admin") {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", py: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          🚧 MMS Under Construction
        </Typography>
        <Typography variant="body1">
          This section is currently being developed. Please check back soon for
          new features related to assets, inspections, and maintenance tracking.
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
            onChange={handleChange}
            centered
            textColor="primary"
            indicatorColor="primary"
          >
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
          <InspectionOverview />
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
          <WorkOrdersPage />
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
