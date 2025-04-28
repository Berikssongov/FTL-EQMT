// src/components/ServiceRecordForm.tsx
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

import { addServiceRecord } from "../services/serviceRecordsService"; // We'll create this service file next!

interface ServiceRecordFormProps {
  open: boolean;
  onClose: () => void;
  equipmentId: string;
  onSaved: () => void;
}

const ServiceRecordForm: React.FC<ServiceRecordFormProps> = ({
  open,
  onClose,
  equipmentId,
  onSaved,
}) => {
  const [form, setForm] = useState({
    date: "",
    serviceType: "",
    notes: "",
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
      await addServiceRecord({
        equipmentId,
        ...form,
        date: form.date ? new Date(form.date).toISOString() : "",
      });
      onSaved();
      onClose();
      setForm({ date: "", serviceType: "", notes: "" });
    } catch (error) {
      console.error("Error adding service record:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Service Record</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Service Date"
              name="date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={form.date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Service Type"
              name="serviceType"
              fullWidth
              variant="outlined"
              value={form.serviceType}
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

export default ServiceRecordForm;
