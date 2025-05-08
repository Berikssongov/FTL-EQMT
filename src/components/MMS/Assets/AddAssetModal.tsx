// src/components/MMS/Assets/AddAssetModal.tsx

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

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS = [
  "Buildings",
  "Grounds",
  "Fortifications",
  "Grounds Trails",
  "Presentations",
  "Utilities",
];

const AddAssetModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState({
    assetId: "",
    name: "",
    category: "",
    type: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await addDoc(collection(db, "assets"), form);
    onSaved();
    setForm({ assetId: "", name: "", category: "", type: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Asset ID"
              name="assetId"
              value={form.assetId}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Asset Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Category"
              name="category"
              select
              value={form.category}
              onChange={handleChange}
              fullWidth
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} {...({} as any)}>
            <TextField
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
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

export default AddAssetModal;
