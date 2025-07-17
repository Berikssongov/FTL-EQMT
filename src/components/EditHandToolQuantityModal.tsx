/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/EditHandToolQuantityModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Grid,
} from "@mui/material";

import { updateHandToolQuantity } from "../services/handToolsService"; // we'll add this next

interface EditHandToolQuantityModalProps {
  open: boolean;
  onClose: () => void;
  toolId: string;
  currentQuantity: number;
  onSaved: () => void;
}

const EditHandToolQuantityModal: React.FC<EditHandToolQuantityModalProps> = ({
  open,
  onClose,
  toolId,
  currentQuantity,
  onSaved,
}) => {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateHandToolQuantity(toolId, quantity);
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Quantity</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
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

export default EditHandToolQuantityModal;
