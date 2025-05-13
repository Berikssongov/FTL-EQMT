import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
  componentIds: string[];
};

const InspectionWizard: React.FC<Props> = ({ open, onClose, componentIds }) => {
  const [inspectionFrequency, setInspectionFrequency] = useState("");
  const { user, firstName, lastName } = useAuth();  // ✅ Matches usage elsewhere

  const submittedBy =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : user?.email || user?.uid || "Unknown User";
  

  const handleSave = async () => {
    if (componentIds.length === 0) return;

    try {
      // Update components with the selected inspection frequency
      const updates = componentIds.map(async (id) => {
        const componentRef = doc(db, "components", id);
        await updateDoc(componentRef, {
          inspectionFrequency,
          nextInspectionDue: calculateNextDueDate(inspectionFrequency),
        });
      });

      await Promise.all(updates);
      onClose();
    } catch (err) {
      console.error("Error saving inspection frequency:", err);
    }
  };

  const calculateNextDueDate = (frequency: string): string => {
    const today = new Date();
    let nextDueDate = new Date(today);

    if (frequency === "Monthly") {
      nextDueDate.setMonth(today.getMonth() + 1);
    } else if (frequency === "Quarterly") {
      nextDueDate.setMonth(today.getMonth() + 3);
    } else if (frequency === "Yearly") {
      nextDueDate.setFullYear(today.getFullYear() + 1);
    }

    return nextDueDate.toISOString().split("T")[0];  // return date in YYYY-MM-DD format
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Inspection Frequency</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Inspection Frequency"
          type="text"
          fullWidth
          value={inspectionFrequency}
          onChange={(e) => setInspectionFrequency(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InspectionWizard;
