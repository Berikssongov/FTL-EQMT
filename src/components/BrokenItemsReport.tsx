/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

import { fetchEquipment } from "../services/equipmentServices";
import { fetchHandTools } from "../services/handToolsService";
import { fetchPowerTools } from "../services/powerToolsService";
import { Equipment, HandTool, PowerTool } from "../types";

const BrokenItemsReport: React.FC = () => {
  const [brokenEquipment, setBrokenEquipment] = useState<Equipment[]>([]);
  const [brokenHandTools, setBrokenHandTools] = useState<HandTool[]>([]);
  const [brokenPowerTools, setBrokenPowerTools] = useState<PowerTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokenItems();
  }, []);

  const loadBrokenItems = async () => {
    setLoading(true);

    const [equipments, handTools, powerTools] = await Promise.all([
      fetchEquipment(),
      fetchHandTools(),
      fetchPowerTools(),
    ]);

    setBrokenEquipment(equipments.filter((e) => e.condition === "Broken"));
    setBrokenHandTools(handTools.filter((t) => t.condition === "Broken"));
    setBrokenPowerTools(powerTools.filter((t) => t.condition === "Broken"));

    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Broken Items Overview
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brokenEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>Equipment</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {brokenPowerTools.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>Power Tool</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.serialNumber || "—"}</TableCell>
                </TableRow>
              ))}
              {brokenHandTools.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>Hand Tool</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>Qty: {item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default BrokenItemsReport;
