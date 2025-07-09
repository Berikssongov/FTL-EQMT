import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { doc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRole } from "../../contexts/RoleContext";
import { useAuth } from "../../contexts/AuthContext";

interface KeyFormPanelProps {
  keys: any[];
  refreshKeys: () => Promise<void>;
}

const lockboxOptions = [
  "Maintenance Box",
  "Operations Box",
  "Artifacts Box",
  "Visitor Centre Box",
  "Other",
];

const KeyFormPanel: React.FC<KeyFormPanelProps> = ({ keys, refreshKeys }) => {
  const { user } = useAuth();
  const { role } = useRole();

  if (role !== "admin" && role !== "manager") return null;

  const [action, setAction] = useState("Signing Out");
  const [person, setPerson] = useState("");
  const [lockbox, setLockbox] = useState("");
  const [customLockbox, setCustomLockbox] = useState("");
  const [keyName, setKeyName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resolvedLockbox = lockbox === "Other" ? customLockbox.trim() : lockbox;

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!keyName || !person || !resolvedLockbox || quantity < 1) {
      setError("Please fill in all fields.");
      return;
    }

    const key = keys.find((k) => k.keyName === keyName && !k.isRestricted);
    if (!key) {
      setError("Key not found.");
      return;
    }

    const holder = {
      type: action === "Signing Out" ? "person" : "lockbox",
      name: action === "Signing Out" ? person : resolvedLockbox,
      quantity,
    };

    const oppositeHolder = {
      type: action === "Signing Out" ? "lockbox" : "person",
      name: action === "Signing Out" ? resolvedLockbox : person,
    };

    const existing = [...key.holders];
    const match = existing.find(
      (h) =>
        h.type === oppositeHolder.type &&
        h.name.trim().toLowerCase() === oppositeHolder.name.trim().toLowerCase()
    );

    if (!match || match.quantity < quantity) {
      setError(`Not enough keys in ${oppositeHolder.name}.`);
      return;
    }

    match.quantity -= quantity;
    if (match.quantity <= 0) {
      const index = existing.indexOf(match);
      if (index > -1) existing.splice(index, 1);
    }

    const sameHolder = existing.find(
      (h) =>
        h.type === holder.type &&
        h.name.trim().toLowerCase() === holder.name.trim().toLowerCase()
    );
    if (sameHolder) {
      sameHolder.quantity += quantity;
    } else {
      existing.push(holder);
    }

    try {
      await updateDoc(doc(db, "keys", key.id), {
        holders: existing,
      });

      await setDoc(doc(db, "keyLogs", `${Date.now()}_${keyName}`), {
        keyName,
        action,
        person,
        lockbox: resolvedLockbox,
        timestamp: Timestamp.now(),
        submittedBy: user?.displayName || "Unknown",
      });

      setSuccess(
        `${keyName} ${action === "Signing Out" ? "signed out to" : "returned to"} ${
          action === "Signing Out" ? person : resolvedLockbox
        }`
      );
    } catch (err) {
      setError("Failed to update Firestore. See console.");
      return;
    }

    setKeyName("");
    setPerson("");
    setLockbox("");
    setCustomLockbox("");
    setQuantity(1);

    try {
      await refreshKeys();
    } catch (err) {
      setError("Key was updated, but refresh failed due to permission error.");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Sign Key In / Out
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} {...({} as any)}>
            <TextField
              select
              label="Key Name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              fullWidth
              sx={{ minWidth: 140, flexGrow: 1 }}
            >
              {keys.map((k) => (
                <MenuItem key={k.id} value={k.keyName}>
                  {k.keyName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4} {...({} as any)}>
            <TextField
              select
              label="Action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              fullWidth
            >
              <MenuItem value="Signing Out">Sign Out</MenuItem>
              <MenuItem value="Signing In">Sign In</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4} {...({} as any)}>
            {action === "Signing Out" ? (
              <TextField
                label="Person"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                fullWidth
              />
            ) : (
              <>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Lockbox</InputLabel>
                  <Select
                    value={lockbox}
                    label="Lockbox"
                    onChange={(e) => setLockbox(e.target.value)}
                  >
                    {lockboxOptions.map((box) => (
                      <MenuItem key={box} value={box}>
                        {box}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {lockbox === "Other" && (
                  <TextField
                    label="Custom Lockbox Name"
                    value={customLockbox}
                    onChange={(e) => setCustomLockbox(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
          </Grid>

          <Grid item xs={12} sm={4} {...({} as any)}>
            {action === "Signing Out" ? (
              <>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Lockbox</InputLabel>
                  <Select
                    value={lockbox}
                    label="Lockbox"
                    onChange={(e) => setLockbox(e.target.value)}
                  >
                    {lockboxOptions.map((box) => (
                      <MenuItem key={box} value={box}>
                        {box}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {lockbox === "Other" && (
                  <TextField
                    label="Custom Lockbox Name"
                    value={customLockbox}
                    onChange={(e) => setCustomLockbox(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            ) : (
              <TextField
                label="Person"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                fullWidth
              />
            )}
          </Grid>

          <Grid item xs={12} sm={2} {...({} as any)}>
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

          <Grid item xs={12} {...({} as any)}>
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default KeyFormPanel;
