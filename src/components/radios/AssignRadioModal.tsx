import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { db } from "../../firebase";
import { Radio } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  radio: Radio | null;
  radios: Radio[];
  onUpdated: () => void;
}

const AssignRadioModal: React.FC<Props> = ({
  open,
  onClose,
  radio,
  radios,
  onUpdated,
}) => {
  const [selectedRadioId, setSelectedRadioId] = useState("");
  const [personName, setPersonName] = useState("");
  const [surveillanceKit, setSurveillanceKit] = useState(false);
  const [earpiece, setEarpiece] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableRadios = radios.filter((r) => r.status === "available");

  useEffect(() => {
    if (open) {
      setPersonName("");
      setSurveillanceKit(false);
      setEarpiece(false);
      setSelectedRadioId(radio?.id ?? "");
    }
  }, [open, radio]);

  const selectedRadio =
    radio || radios.find((r) => r.id === selectedRadioId) || null;

  // =========================
  // Sign Out
  // =========================
  const handleAssign = async () => {
    if (!selectedRadio || !personName) return;

    try {
      setSaving(true);
      const now = Timestamp.now();
      const radioRef = doc(db, "radios", selectedRadio.id);

      const accessories: string[] = [];
      if (surveillanceKit) {
        accessories.push("Surveillance Kit");
        if (earpiece) accessories.push("Earpiece");
      }

      // Update radio status
      await updateDoc(radioRef, {
        status: "assigned",
        assignedTo: personName,
        assignedAt: now,
      });

      // Create new assignment
      await addDoc(collection(db, "radioAssignments"), {
        radioId: selectedRadio.id,
        radioCallsign: selectedRadio.callsign,
        radioNumber: selectedRadio.radioNumber,
        serialNumber: selectedRadio.serialNumber,
        personName,
        assignedAt: now,
        returnedAt: null,
        accessories,
        replacementParts: [],
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Sign In
  // =========================
  const handleReturn = async () => {
    if (!selectedRadio) return;

    try {
      setSaving(true);
      const now = Timestamp.now();
      const radioRef = doc(db, "radios", selectedRadio.id);

      // Update radio
      await updateDoc(radioRef, {
        status: "available",
        assignedTo: null,
        assignedAt: null,
      });

      // Update the current assignment (returnedAt)
      const snapshot = await getDocs(collection(db, "radioAssignments"));
      const currentAssignment = snapshot.docs.find(
        (doc) =>
          doc.data().radioId === selectedRadio.id &&
          !doc.data().returnedAt
      );

      if (currentAssignment) {
        const assignmentRef = doc(db, "radioAssignments", currentAssignment.id);
        await updateDoc(assignmentRef, {
          returnedAt: now,
        });
      }

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selectedRadio?.status === "assigned"
          ? "Sign In Radio"
          : "Sign Out Radio"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {!radio && (
            <TextField
              select
              label="Select Radio"
              value={selectedRadioId}
              onChange={(e) => setSelectedRadioId(e.target.value)}
              fullWidth
            >
              {availableRadios.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.radioNumber} - {r.callsign}
                </MenuItem>
              ))}
            </TextField>
          )}

          {selectedRadio?.status === "available" && (
            <>
              <TextField
                label="Person Signing Out"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={surveillanceKit}
                    onChange={(e) => {
                      setSurveillanceKit(e.target.checked);
                      if (!e.target.checked) setEarpiece(false);
                    }}
                  />
                }
                label="Surveillance Kit Issued"
              />

              {surveillanceKit && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={earpiece}
                      onChange={(e) => setEarpiece(e.target.checked)}
                    />
                  }
                  label="Include Earpiece"
                />
              )}
            </>
          )}

          {selectedRadio?.status === "assigned" && (
            <TextField
              label="Currently Assigned To"
              value={selectedRadio.assignedTo || ""}
              disabled
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>

        {selectedRadio?.status === "available" ? (
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedRadio || !personName || saving}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            onClick={handleReturn}
            disabled={!selectedRadio || saving}
          >
            Sign In
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignRadioModal;