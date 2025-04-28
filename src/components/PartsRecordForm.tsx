// src/components/PartsRecordForm.tsx
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

import { addPartRecord } from "../services/partsRecordsService"; // We'll create this service file next!

interface PartsRecordFormProps {
  open: boolean;
  onClose: () => void;
  equipmentId: string;
  onSaved: () => void;
}

const PartsRecordForm: React.FC<PartsRecordFormProps> = ({
  open,
  onClose,
  equipmentId,
  onSaved,
}) => {
  const [form, setForm] = useState({
    dateInstalled: "",
    partName: "",
    notes: "",
    cost: "",
  });
  const [saving, setSaving] = useState(false);

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
      await addPartRecord({
        equipmentId,
        ...form,
        dateInstalled: form.dateInstalled
          ? new Date(form.dateInstalled).toISOString()
          : "",
        cost: form.cost ? parseFloat(form.cost) : 0,
      });
      onSaved();
      onClose();
      setForm({ dateInstalled: "", partName: "", notes: "", cost: "" });
    } catch (error) {
      console.error("Error adding part record:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Part Record</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Date Installed"
              name="dateInstalled"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={form.dateInstalled}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Part Name"
              name="partName"
              fullWidth
              variant="outlined"
              value={form.partName}
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

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Cost"
              name="cost"
              fullWidth
              variant="outlined"
              value={form.cost}
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

export default PartsRecordForm;
