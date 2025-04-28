// src/components/EquipmentEditModal.tsx
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
  Divider,
  Typography,
} from "@mui/material";

import { Equipment, Location } from "../types";
import { updateEquipment } from "../services/equipmentServices";
import { fetchLocations } from "../services/locationsService";

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
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    setForm(equipment);
    if (open) {
      loadLocations();
    }
  }, [equipment, open]);

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
              sx={{ minWidth: "200px" }}
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

          {/* Divider for Legal Info */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Legal Information
            </Typography>
          </Grid>

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

          {/* Divider for Engine Info */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Engine Information
            </Typography>
          </Grid>

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

          {/* Divider for Specs */}
          <Grid item xs={12} {...({} as any)}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Equipment Specifications
            </Typography>
          </Grid>

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
