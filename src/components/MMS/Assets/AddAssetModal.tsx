// MMS/Assets/AddAssetModal.tsx
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

interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const categories = ["Building", "Parking Lot", "Orchard", "Storage", "Other"];

const AddAssetModal: React.FC<AddAssetModalProps> = ({ open, onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async () => {
    if (!name || !assetNumber || !category) return;

    await addDoc(collection(db, "assets"), {
      name,
      assetNumber,
      category,
      createdAt: new Date(),
    });

    setName("");
    setAssetNumber("");
    setCategory("");
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Asset Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Asset Number"
              fullWidth
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAssetModal;
