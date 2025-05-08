import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  assetId: string;
}

const AddComponentModal: React.FC<Props> = ({ open, onClose, onSaved, assetId }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  const handleSubmit = async () => {
    if (!name || !type) return;
    try {
      await addDoc(collection(db, "components"), {
        assetId,
        name,
        type,
        location,
        inspection: {
          frequency,
          lastChecked: null,
          nextDue: null,
          status: "pending",
        },
        createdAt: serverTimestamp(),
      });
      onSaved();
    } catch (err) {
      console.error("Error adding component:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Component</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Component Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
          <TextField
            label="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            select
            label="Inspection Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {["daily", "weekly", "monthly", "quarterly", "yearly"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
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

export default AddComponentModal;
