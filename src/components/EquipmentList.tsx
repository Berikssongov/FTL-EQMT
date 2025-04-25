// src/components/EquipmentList.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";

import { fetchEquipment } from "../services/equipmentServices";
import { Equipment } from "../types";
import AddEquipmentModal from "./AddEquipmentModal";

const EquipmentList: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await fetchEquipment();
      setEquipmentList(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Equipment List</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Add Equipment
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : equipmentList.length === 0 ? (
        <Typography>No equipment found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="equipment table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Inspection</TableCell>
                <TableCell>Assigned To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.lastInspection || "—"}</TableCell>
                  <TableCell>{item.assignedTo || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AddEquipmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAdded={() => {
          loadEquipment(); // refresh the list after adding
          setOpenModal(false);
        }}
      />
    </>
  );
};

export default EquipmentList;
