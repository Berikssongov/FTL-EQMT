// src/components/Keys/AddKeyPanel.tsx
import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Button,
  Alert,
  Collapse,
  Box,
} from "@mui/material";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRole } from "../../contexts/RoleContext";

interface AddKeyPanelProps {
  refreshKeys: () => Promise<void>;
}

const AddKeyPanel: React.FC<AddKeyPanelProps> = ({ refreshKeys }) => {
  const { role } = useRole();

  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lockbox, setLockbox] = useState("");
  const [customLockbox, setCustomLockbox] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (role !== "admin") return null;

  const handleAddKey = async () => {
    setError("");
    setSuccess("");

    const trimmedKey = keyName.trim();
    const finalLockbox = lockbox === "Other" ? customLockbox.trim() : lockbox.trim();

    if (!trimmedKey || !finalLockbox || quantity < 1) {
      setError("Please fill in all fields.");
      return;
    }

    const snap = await getDocs(collection(db, "keys"));
    const keys = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    const existing = keys.find(
      (k) =>
        !k.isRestricted &&
        k.keyName.trim().toLowerCase() === trimmedKey.toLowerCase()
    );

    if (existing) {
      const keyRef = doc(db, "keys", existing.id);
      const holders = [...existing.holders];
      const found = holders.find(
        (h) =>
          h.type === "lockbox" &&
          h.name.trim().toLowerCase() === finalLockbox.toLowerCase()
      );

      if (found) {
        found.quantity += quantity;
      } else {
        holders.push({ type: "lockbox", name: finalLockbox, quantity });
      }

      await updateDoc(keyRef, { holders });
      setSuccess(`Updated "${trimmedKey}" with ${quantity} key(s) at ${finalLockbox}.`);
    } else {
      const newKey = {
        keyName: trimmedKey,
        isRestricted: false,
        holders: [{ type: "lockbox", name: finalLockbox, quantity }],
      };
      await addDoc(collection(db, "keys"), newKey);
      setSuccess(`Created new key "${trimmedKey}" with ${quantity} at ${finalLockbox}.`);
    }

    await refreshKeys();

    setKeyName("");
    setQuantity(1);
    setLockbox("");
    setCustomLockbox("");
    setShowForm(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setShowForm((prev) => !prev)}
        sx={{ mb: 2 }}
      >
        {showForm ? "Hide Add Key Form" : "➕ Add Key"}
      </Button>

      <Collapse in={showForm}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Add New Key to Lockbox
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Key Name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                fullWidth
                sx={{ maxWidth: 140 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                fullWidth
                sx={{ maxWidth: 80 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
             <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Lockbox</InputLabel>
                <Select
                  value={lockbox}
                  onChange={(e) => setLockbox(e.target.value)}
                  label="Lockbox"
                >
                  <MenuItem value="Maintenance Box">Maintenance Box</MenuItem>
                  <MenuItem value="Operations Box">Operations Box</MenuItem>
                  <MenuItem value="Artifacts Box">Artifacts Box</MenuItem>
                  <MenuItem value="Visitor Centre Box">Visitor Centre Box</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {lockbox === "Other" && (
              <Grid item xs={12} {...({} as any)}>
                <TextField
                  label="Custom Lockbox Name"
                  value={customLockbox}
                  onChange={(e) => setCustomLockbox(e.target.value)}
                  fullWidth
                />
              </Grid>
            )}

            <Grid item xs={12} {...({} as any)}>
              <Button variant="contained" fullWidth onClick={handleAddKey}>
                Add / Update Key
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default AddKeyPanel;
