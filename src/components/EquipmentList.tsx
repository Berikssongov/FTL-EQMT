import React, { useEffect, useState, useContext } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { fetchEquipment } from "../services/equipmentServices";
import { Equipment } from "../types";
import AddEquipmentModal from "./AddEquipmentModal";
import { useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const EquipmentList: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { role } = useRole();

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
    <Box sx={{ p: 2 }}>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600} sx={{ mb: 2 }}>
        Equipment List
      </Typography>

      {role === "admin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Add Equipment
          </Button>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : equipmentList.length === 0 ? (
        <Typography>No equipment found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table aria-label="equipment table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Inspection</TableCell>
                <TableCell>Assigned To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentList.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/equipment/${item.id}`)}
                >
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

      {role === "admin" && (
        <AddEquipmentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSaved={() => {
            loadEquipment();
            setOpenModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default EquipmentList;
