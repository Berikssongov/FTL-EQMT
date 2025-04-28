// src/components/EditPowerToolModal.tsx
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

import { updatePowerTool } from "../services/powerToolsService";
import { PowerTool, Location } from "../types";
import { fetchLocations } from "../services/locationsService";

interface EditPowerToolModalProps {
  open: boolean;
  onClose: () => void;
  tool: PowerTool;
  onSaved: () => void;
}

const EditPowerToolModal: React.FC<EditPowerToolModalProps> = ({
  open,
  onClose,
  tool,
  onSaved,
}) => {
  const [form, setForm] = useState<PowerTool>(tool);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    setForm(tool);
    if (open) {
      loadLocations();
    }
  }, [tool, open]);

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
      await updatePowerTool(form.id!, form);
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error updating power tool:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Power Tool</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          {/* Name */}
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
              sx={{ minWidth: "200px" }}
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

          {/* Serial Number */}
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

          {/* Condition */}
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
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPowerToolModal;
