import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { collection, addDoc, Timestamp } from "firebase/firestore";

import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateRadioModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();

  const [callsign, setCallsign] = useState("");
  const [radioNumber, setRadioNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔁 reset form every time modal opens
  useEffect(() => {
    if (open) {
      setCallsign("");
      setRadioNumber("");
      setSerialNumber("");
      setSaving(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!callsign || !radioNumber || !serialNumber) return;

    try {
      setSaving(true);

      await addDoc(collection(db, "radios"), {
        callsign: callsign.trim(),
        radioNumber: radioNumber.trim(),
        serialNumber: serialNumber.trim(),
        status: "available",
        assignedTo: null,
        assignedAt: null,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || null,
      });

      onCreated(); // 🔔 tell parent to refresh list
      onClose();
    } catch (error) {
      console.error("Error creating radio:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Radio</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Callsign"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            fullWidth
          />
          <TextField
            label="Radio Number"
            value={radioNumber}
            onChange={(e) => setRadioNumber(e.target.value)}
            fullWidth
          />
          <TextField
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={saving || !callsign || !radioNumber || !serialNumber}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRadioModal;