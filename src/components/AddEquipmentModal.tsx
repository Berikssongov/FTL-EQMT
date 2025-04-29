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
} from "@mui/material";
import { Equipment, Location } from "../types";
import { addEquipment } from "../services/equipmentServices";
import { fetchLocations } from "../services/locationsService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AddEquipmentModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState<Equipment>({
    name: "",
    category: "",
    make: "",
    modelNumber: "",
    serialNumber: "",
    status: "available",
    location: "",
    notes: "",
    condition: "Good",
    legal: {},
    engine: {},
  });

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (open) loadLocations();
  }, [open]);

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
    await addEquipment(form);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Equipment</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEquipmentModal;
