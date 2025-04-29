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
import { HandTool, Location } from "../types";
import { addHandTool } from "../services/handToolsService";
import { fetchLocations } from "../services/locationsService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AddHandToolModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState<HandTool>({
    name: "",
    location: "",
    condition: "Good",
    quantity: 1,
  });

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (open) loadLocations();
  }, [open]);

  const loadLocations = async () => {
    const data = await fetchLocations();
    setLocations(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    await addHandTool(form);
    onSaved();
    onClose();
    setForm({
      name: "",
      location: "",
      condition: "Good",
      quantity: 1,
    });
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

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Location"
              name="location"
              select
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
              select
              fullWidth
              variant="outlined"
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
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHandToolModal;
