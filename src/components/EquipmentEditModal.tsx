/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Divider,
  Typography,
  CircularProgress,
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
    if (open) loadLocations();
  }, [equipment, open]);

  const loadLocations = async () => {
    const data = await fetchLocations();
    setLocations(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("legal.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        legal: { ...prev.legal, [field]: value },
      }));
    } else if (name.startsWith("engine.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        engine: { ...prev.engine, [field]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    await updateEquipment(form.id!, form);
    onSaved();
    onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Equipment</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          {/* Core */}
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Name"
              name="name"
              fullWidth
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
              value={form.category}
              onChange={handleChange}
            >
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="vehicle">Vehicle</MenuItem>
              <MenuItem value="trailer">Trailer</MenuItem>
              <MenuItem value="landscaping">Landscaping</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Make"
              name="make"
              fullWidth
              value={form.make}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Model Number"
              name="modelNumber"
              fullWidth
              value={form.modelNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Serial Number"
              name="serialNumber"
              fullWidth
              value={form.serialNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Status"
              name="status"
              fullWidth
              value={form.status}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Condition"
              name="condition"
              select
              fullWidth
              value={form.condition}
              onChange={handleChange}
            >
              <MenuItem value="Excellent">Excellent</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
              <MenuItem value="Broken">Broken</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Location"
              name="location"
              select
              fullWidth
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
              value={form.notes}
              onChange={handleChange}
            />
          </Grid>

          {/* Legal Info */}
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
              value={form.legal?.licensePlate || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Insurance Info"
              name="legal.insuranceInfo"
              fullWidth
              value={form.legal?.insuranceInfo || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Engine Info */}
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
              value={form.engine?.serialNumber || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Engine Model Number"
              name="engine.modelNumber"
              fullWidth
              value={form.engine?.modelNumber || ""}
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
