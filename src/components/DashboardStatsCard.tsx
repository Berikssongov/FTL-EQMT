import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface Props {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  color?: string;
}

const DashboardStatsCard: React.FC<Props> = ({ title, value, icon: Icon, color = "#2B4635" }) => {
  return (
    <Card sx={{ display: "flex", alignItems: "center", px: 2, py: 1 }}>
      <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
        <Icon sx={{ fontSize: 36, color }} />
      </Box>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
