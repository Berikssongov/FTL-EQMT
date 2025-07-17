/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/EditPartModal.tsx
import React, { useEffect, useState } from "react";
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
import { PartRecord } from "../types";
import { updatePartRecord } from "../services/partsRecordsService";

interface EditPartModalProps {
  open: boolean;
  onClose: () => void;
  part: PartRecord;
  onSaved: () => void;
}

const EditPartModal: React.FC<EditPartModalProps> = ({
  open,
  onClose,
  part,
  onSaved,
}) => {
  const [form, setForm] = useState<PartRecord>(part);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(part);
  }, [part]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await updatePartRecord(form.id!, form);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error updating part:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Part Record</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Part Name"
              name="partName"
              fullWidth
              variant="outlined"
              value={form.partName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Part Number"
              name="partNumber"
              fullWidth
              variant="outlined"
              value={form.partNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor"
              name="vendor"
              fullWidth
              variant="outlined"
              value={form.vendor || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor Name"
              name="vendorName"
              fullWidth
              variant="outlined"
              value={form.vendorName || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor Contact"
              name="vendorContact"
              fullWidth
              variant="outlined"
              value={form.vendorContact || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Price"
              name="price"
              fullWidth
              type="number"
              variant="outlined"
              value={form.price.toString()}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Date Installed"
              name="dateInstalled"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dateInstalled || ""}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPartModal;
