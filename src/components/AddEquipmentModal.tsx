// src/components/AddEquipmentModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";

import { addEquipment } from "../services/equipmentServices";
import { fetchLocations } from "../services/locationsService";
import { Equipment } from "../types";
import { Location } from "../types";

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;  // Renamed from onSaved to onAdded
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  open,
  onClose,
  onAdded,  // Renamed prop here
}) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "available",
    location: "",
    notes: "",
    make: "",
    serialNumber: "",
    modelNumber: "",
    legal: {},
    engine: {},
  });
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (open) {
      loadLocations();
    }
  }, [open]);

  const loadLocations = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await addEquipment(form as Equipment);
      onAdded();  // Use onAdded here instead of onSaved
      onClose();
      setForm({
        name: "",
        category: "",
        status: "available",
        location: "",
        notes: "",
        make: "",
        serialNumber: "",
        modelNumber: "",
        legal: {},
        engine: {},
      });
    } catch (error) {
      console.error("Error adding equipment:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Equipment</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          {/* Name */}
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              variant="outlined"
              value={form.name}
              onChange={handleChange}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} {...({} as any)}>
            <TextField
              select
              label="Category"
              name="category"
              fullWidth
              variant="outlined"
              value={form.category}
              onChange={handleChange}
            >
              <MenuItem value="Landscaping">Landscaping</MenuItem>
              <MenuItem value="Trailer">Trailer</MenuItem>
              <MenuItem value="Equipment">Equipment</MenuItem>
              <MenuItem value="Vehicle">Vehicle</MenuItem>
            </TextField>
          </Grid>

          {/* Location Dropdown */}
          <Grid item xs={12} {...({} as any)}>
            <TextField
              select
              label="Location"
              name="location"
              fullWidth
              variant="outlined"
              value={form.location}
              onChange={handleChange}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status */}
          <Grid item xs={12} {...({} as any)}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              variant="outlined"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in use">In Use</MenuItem>
              <MenuItem value="damaged">Damaged</MenuItem>
            </TextField>
          </Grid>

          {/* Notes */}
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Notes"
              name="notes"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={form.notes}
              onChange={handleChange}
            />
          </Grid>

          {/* Serial/Model/Make */}
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Make"
              name="make"
              fullWidth
              variant="outlined"
              value={form.make}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Serial Number"
              name="serialNumber"
              fullWidth
              variant="outlined"
              value={form.serialNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Model Number"
              name="modelNumber"
              fullWidth
              variant="outlined"
              value={form.modelNumber}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEquipmentModal;
