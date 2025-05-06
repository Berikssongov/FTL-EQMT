// MMS/Components/AddComponentModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

interface AddComponentModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  assetId: string;
}

const categories = ["Door", "Window", "Roof", "Handrail", "Siding", "Electrical", "Plumbing"];

const AddComponentModal: React.FC<AddComponentModalProps> = ({ open, onClose, onAdded, assetId }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!name || !category || !status) return;

    await addDoc(collection(db, "components"), {
      name,
      category,
      status,
      assetId,
      createdAt: new Date(),
    });

    setName("");
    setCategory("");
    setStatus("");
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Component</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Component Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Category"
              select
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Status"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;
