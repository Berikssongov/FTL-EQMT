// src/components/EquipmentDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";

import { Equipment } from "../types";
import { getEquipmentById } from "../services/equipmentServices";

const EquipmentDetails: React.FC = () => {
  const { id } = useParams(); // grabs the ID from the URL
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        if (!id) return;
        const item = await getEquipmentById(id);
        setEquipment(item);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  if (loading) return <CircularProgress />;

  if (!equipment) return <Typography>No equipment found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={600}>
            {equipment.name}
          </Typography>
          <Button variant="contained" color="primary">
            Edit
          </Button>
        </Stack>

        <Typography variant="subtitle1" color="textSecondary">
          Category: {equipment.category}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography>
            <strong>Make:</strong> {equipment.make}
          </Typography>
          <Typography>
            <strong>Model:</strong> {equipment.modelNumber}
          </Typography>
          <Typography>
            <strong>Serial:</strong> {equipment.serialNumber}
          </Typography>
          <Typography>
            <strong>Status:</strong> {equipment.status}
          </Typography>
          <Typography>
            <strong>Location:</strong> {equipment.location}
          </Typography>
          <Typography>
            <strong>Notes:</strong> {equipment.notes || "—"}
          </Typography>
        </Box>
      </Paper>

      {/* Future tabs/sections like service, parts, documents go here */}
    </Box>
  );
};

export default EquipmentDetails;
