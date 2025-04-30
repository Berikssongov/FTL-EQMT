import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import InventoryIcon from "@mui/icons-material/Warehouse";
import WarningIcon from "@mui/icons-material/ReportProblem";
import BuildIcon from "@mui/icons-material/Build";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import DashboardStatsCard from "./DashboardStatsCard";
import BrokenItemsReport from "./BrokenItemsReport";

import { fetchEquipment } from "../services/equipmentServices";
import { fetchHandTools } from "../services/handToolsService";
import { fetchPowerTools } from "../services/powerToolsService";

const DashboardHome: React.FC = () => {
  const [equipmentCount, setEquipmentCount] = useState<number>(0);
  const [brokenCount, setBrokenCount] = useState<number>(0);
  const [handToolsCount, setHandToolsCount] = useState<number>(0);
  const [powerToolsCount, setPowerToolsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const [equipment, handTools, powerTools] = await Promise.all([
      fetchEquipment(),
      fetchHandTools(),
      fetchPowerTools(),
    ]);

    setEquipmentCount(equipment.length);
    setBrokenCount(
      equipment.filter((e) => e.condition === "Broken").length +
        handTools.filter((t) => t.condition === "Broken").length +
        powerTools.filter((t) => t.condition === "Broken").length
    );
    setHandToolsCount(handTools.length);
    setPowerToolsCount(powerTools.length);

    setLoading(false);
  };

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight={600}
        sx={{ mb: 4 }}
      >
        Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }} {...({} as any)}>
            <Grid item xs={12} sm={6} md={3} {...({} as any)}>
              <DashboardStatsCard
                title="Total Equipment"
                value={equipmentCount}
                icon={InventoryIcon}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} {...({} as any)}>
              <DashboardStatsCard
                title="Broken Items"
                value={brokenCount}
                icon={WarningIcon}
                color="#c62828"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} {...({} as any)}>
              <DashboardStatsCard
                title="Hand Tools"
                value={handToolsCount}
                icon={BuildIcon}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} {...({} as any)}>
              <DashboardStatsCard
                title="Power Tools"
                value={powerToolsCount}
                icon={PrecisionManufacturingIcon}
              />
            </Grid>
          </Grid>

          {/* Broken Items */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              overflowX: "auto",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 2, whiteSpace: "nowrap" }}
            >
              Recently Marked as Broken
            </Typography>
            <BrokenItemsReport />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DashboardHome;
