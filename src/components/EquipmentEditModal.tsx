// src/components/EquipmentEditModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import { Equipment } from "../types";
import { updateEquipment } from "../services/equipmentServices"; // We already added this!

interface EquipmentEditModalProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  onSaved: () => void;
}

const EquipmentEditModal: React.FC<EquipmentEditModalProps> = ({
  open,
  onClose,
  equipment,
  onSaved,
}) => {
  const [form, setForm] = useState<Equipment>(equipment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(equipment);
  }, [equipment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Nested fields (legal and engine)
    if (name.startsWith("legal.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        legal: {
          ...prev.legal,
          [field]: value,
        },
      }));
    } else if (name.startsWith("engine.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        engine: {
          ...prev.engine,
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await updateEquipment(form.id!, form);
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error updating equipment:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Equipment</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          {/* Core Info */}
          <Grid item xs={12} {...({} as any)}>
            <Typography variant="h6" fontWeight={600}>
              Core Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              variant="outlined"
              value={form.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Category"
              name="category"
              select
              fullWidth
              variant="outlined"
              value={form.category}
              onChange={handleChange}
            >
              <MenuItem value="vehicle">Vehicle</MenuItem>
              <MenuItem value="trailer">Trailer</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="landscaping">Landscaping</MenuItem>
            </TextField>
          </Grid>

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
              label="Model Number"
              name="modelNumber"
              fullWidth
              variant="outlined"
              value={form.modelNumber}
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
              label="Status"
              name="status"
              fullWidth
              variant="outlined"
              value={form.status}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Location"
              name="location"
              fullWidth
              variant="outlined"
              value={form.location}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Notes"
              name="notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={form.notes}
              onChange={handleChange}
            />
          </Grid>

          {/* Divider */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Legal Information
            </Typography>
          </Grid>

          {/* Legal Info */}
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="License Plate"
              name="legal.licensePlate"
              fullWidth
              variant="outlined"
              value={form.legal?.licensePlate || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Insurance Info"
              name="legal.insuranceInfo"
              fullWidth
              variant="outlined"
              value={form.legal?.insuranceInfo || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Divider */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Engine Information
            </Typography>
          </Grid>

          {/* Engine Info */}
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Engine Serial Number"
              name="engine.serialNumber"
              fullWidth
              variant="outlined"
              value={form.engine?.serialNumber || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Engine Model Number"
              name="engine.modelNumber"
              fullWidth
              variant="outlined"
              value={form.engine?.modelNumber || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Divider */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Equipment Specifications
            </Typography>
          </Grid>

          {/* Specs — new fields for weight and towing (optional fields) */}
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Weight Capacity (lbs)"
              name="weightCapacity"
              fullWidth
              variant="outlined"
              value={(form as any).weightCapacity || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Towing Capacity (lbs)"
              name="towingCapacity"
              fullWidth
              variant="outlined"
              value={(form as any).towingCapacity || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Future fields: purchase date, warranty info can go here later */}
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

export default EquipmentEditModal;
