import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import { addPartRecord } from "../services/partsRecordsService";

interface Props {
  open: boolean;
  onClose: () => void;
  equipmentId: string;
  onSaved: () => void;
}

const AddPartModal: React.FC<Props> = ({ open, onClose, equipmentId, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    partNumber: "",
    vendor: "",
    price: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await addPartRecord({
      equipmentId,
      partName: form.name,
      partNumber: form.partNumber,
      vendor: form.vendor,
      price: parseFloat(form.price),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Part</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Part Name"
              name="name"
              fullWidth
              value={form.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Part Number"
              name="partNumber"
              fullWidth
              value={form.partNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor"
              name="vendor"
              fullWidth
              value={form.vendor}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={form.price}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPartModal;
