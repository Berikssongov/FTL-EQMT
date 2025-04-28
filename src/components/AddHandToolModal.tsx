// src/components/AddHandToolModal.tsx
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

import { addHandTool } from "../services/handToolsService";
import { fetchLocations } from "../services/locationsService";
import { Location } from "../types";

interface AddHandToolModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AddHandToolModal: React.FC<AddHandToolModalProps> = ({
  open,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    condition: "",
    quantity: "",
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
      await addHandTool({
        name: form.name,
        location: form.location,
        condition: form.condition,
        quantity: form.quantity ? parseInt(form.quantity) : 0,
      });
      onSaved();
      onClose();
      setForm({ name: "", location: "", condition: "", quantity: "" });
    } catch (error) {
      console.error("Error adding hand tool:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Hand Tool</DialogTitle>

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
              label="Condition"
              name="condition"
              fullWidth
              variant="outlined"
              value={form.condition}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={form.quantity}
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

export default AddHandToolModal;
