/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/EditServiceModal.tsx
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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ServiceRecord, LineItem } from "../types";
import { updateServiceRecord } from "../services/serviceRecordsService";

interface EditServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: ServiceRecord;
  onSaved: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  open,
  onClose,
  service,
  onSaved,
}) => {
  const [form, setForm] = useState<ServiceRecord>(service);
  const [items, setItems] = useState<LineItem[]>(service.items || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(service);
    setItems(service.items || []);
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    if (field === "cost") {
      updated[index][field] = parseFloat(value);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { description: "", cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await updateServiceRecord(service.id!, {
        ...form,
        items,
        totalCost: items.reduce((sum, item) => sum + (item.cost || 0), 0),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error updating service:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Service Record</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Summary"
              name="summary"
              fullWidth
              variant="outlined"
              value={form.summary || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Date"
              name="date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor Name"
              name="vendorName"
              fullWidth
              value={form.vendorName || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Vendor Contact"
              name="vendorContact"
              fullWidth
              value={form.vendorContact || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Line Items */}
          <Grid item xs={12} {...({} as any)}>
            <Button onClick={handleAddItem} variant="outlined" size="small">
              + Add Line Item
            </Button>
          </Grid>

          {items.map((item, index) => (
            <React.Fragment key={index}>
              <Grid item xs={6} {...({} as any)}>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={5} {...({} as any)}>
                <TextField
                  label="Cost"
                  type="number"
                  value={item.cost}
                  onChange={(e) =>
                    handleItemChange(index, "cost", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={1} sx={{ display: "flex", alignItems: "center" }} {...({} as any)}>
                <IconButton onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServiceModal;
