// src/components/AddPowerToolModal.tsx
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

import { addPowerTool } from "../services/powerToolsService";
import { fetchLocations } from "../services/locationsService";
import { Location } from "../types";

interface AddPowerToolModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AddPowerToolModal: React.FC<AddPowerToolModalProps> = ({
  open,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    serialNumber: "",
    condition: "",
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
      await addPowerTool({
        name: form.name,
        location: form.location,
        serialNumber: form.serialNumber,
        condition: form.condition,
      });
      onSaved();
      onClose();
      setForm({ name: "", location: "", serialNumber: "", condition: "" });
    } catch (error) {
      console.error("Error adding power tool:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Power Tool</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Tool Name"
              name="name"
              fullWidth
              variant="outlined"
              value={form.name}
              onChange={handleChange}
            />
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

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Serial Number"
              name="serialNumber"
              fullWidth
              variant="outlined"
              value={form.serialNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Condition"
              name="condition"
              fullWidth
              variant="outlined"
              value={form.condition}
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

export default AddPowerToolModal;
