/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ManageLocationsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import { fetchLocations, addLocation } from "../services/locationsService";
import { Location } from "../types";
import { useRole } from "../contexts/RoleContext";

const ManageLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [saving, setSaving] = useState(false);
  const { role } = useRole();

  useEffect(() => {
    if (role === "admin") {
      loadLocations();
    }
  }, [role]);

  const loadLocations = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleAddLocation = async () => {
    try {
      setSaving(true);
      await addLocation({ name: newLocationName });
      setNewLocationName("");
      setAddOpen(false);
      loadLocations();
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setSaving(false);
    }
  };

  if (role !== "admin") {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error" fontWeight={500}>
          🚫 You do not have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Manage Locations
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setAddOpen(true)}
      >
        Add New Location
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Location Modal */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} {...({} as any)}>
            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Location Name"
                fullWidth
                variant="outlined"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddLocation}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageLocationsPage;
