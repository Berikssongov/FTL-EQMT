// src/components/AddServiceModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

import { addServiceRecord } from "../services/serviceRecordsService";

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  equipmentId: string;
  onSaved: () => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  open,
  onClose,
  equipmentId,
  onSaved,
}) => {
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [contact, setContact] = useState("");
  const [items, setItems] = useState([{ description: "", cost: "" }]);
  const [saving, setSaving] = useState(false);

  const handleItemChange = (
    index: number,
    field: "description" | "cost", // ✅ Only these allowed
    value: string
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };
  

  const addItem = () => {
    setItems([...items, { description: "", cost: "" }]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const totalCost = items.reduce((sum, item) => {
    const cost = parseFloat(item.cost);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      await addServiceRecord({
        equipmentId,
        summary,
        date,
        totalCost,
        items: items.map((i) => ({
          description: i.description,
          cost: parseFloat(i.cost),
        })),
        vendor,
        contact,
      } as any); // 'as any' allows extra fields until Firestore is updated

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving service record:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Service Record</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              fullWidth
              label="Service Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              fullWidth
              label="Service Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              fullWidth
              label="Vendor Name"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              fullWidth
              label="Vendor Contact Info"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <Typography fontWeight={600}>Service Line Items</Typography>
          </Grid>

          {items.map((item, index) => (
  <Grid
    container
    spacing={1}
    alignItems="center"
    key={index}
    sx={{ mb: 1 }}
    {...({} as any)}
  >
    <Grid item xs={6} sm={6} md={6} {...({} as any)}>
      <TextField
        fullWidth
        label="Description"
        value={item.description}
        onChange={(e) =>
          handleItemChange(index, "description", e.target.value)
        }
      />
    </Grid>
    <Grid item xs={4} sm={3} md={3} {...({} as any)}>
      <TextField
        fullWidth
        label="Cost"
        type="number"
        value={item.cost}
        onChange={(e) =>
          handleItemChange(index, "cost", e.target.value)
        }
      />
    </Grid>
    <Grid item xs={2} sm={3} md={3} {...({} as any)}>
      <IconButton onClick={() => removeItem(index)}>
        <DeleteIcon />
      </IconButton>
    </Grid>
  </Grid>
))}


          <Grid item xs={12} {...({} as any)}>
            <Button onClick={addItem} startIcon={<AddIcon />}>
              Add Line Item
            </Button>
          </Grid>

          <Grid item xs={12} {...({} as any)}>
            <Typography variant="h6">
              Total: ${totalCost.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServiceModal;
