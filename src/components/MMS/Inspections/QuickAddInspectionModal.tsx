import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
  componentId: string;
  componentName?: string;
  onSaved?: () => void;
};

const normalizeStatus = (s: string) => {
  if (!s) return "pending";
  const v = s.toLowerCase();
  if (["pass", "yes", "ok", "passed"].includes(v)) return "pass";
  if (["fail", "no", "failed"].includes(v)) return "fail";
  return "pending";
};

const normalizeFrequency = (freqRaw: any): "monthly" | "quarterly" | "annually" | "5-years" => {
  const v = (typeof freqRaw === "string" ? freqRaw : "").toLowerCase().trim();
  if (["monthly"].includes(v)) return "monthly";
  if (["quarterly"].includes(v)) return "quarterly";
  if (["annually", "annual", "yearly", "year"].includes(v)) return "annually";
  if (["5-years", "five years", "five year", "5 year", "5-year"].includes(v)) return "5-years";
  // default to annually
  return "annually";
};

const calcNextDueIso = (normalizedFreq: "monthly" | "quarterly" | "annually" | "5-years", fromIso: string) => {
  const from = new Date(fromIso);
  const next = new Date(from);
  switch (normalizedFreq) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "5-years":
      next.setFullYear(next.getFullYear() + 5);
      break;
    case "annually":
    default:
      next.setFullYear(next.getFullYear() + 1);
  }
  return next.toISOString();
};

const QuickAddInspectionModal: React.FC<Props> = ({
  open,
  onClose,
  componentId,
  componentName,
  onSaved,
}) => {
  const [status, setStatus] = useState<"Pass" | "Fail">("Pass");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, firstName, lastName } = useAuth();
  const inspector =
    (firstName && lastName ? `${firstName} ${lastName}` : user?.email || user?.uid) || "Unknown";

  const handleSave = async () => {
    if (!componentId) return;
    setSaving(true);
    try {
      // Pull minimal component context (assetId + frequency)
      const compRef = doc(db, "components", componentId);
      const compSnap = await getDoc(compRef);
      if (!compSnap.exists()) throw new Error("Component not found");
      const compData: any = compSnap.data();

      const stdFreq = normalizeFrequency(compData.frequency ?? compData?.inspection?.frequency ?? "annually");
      const nowIso = new Date().toISOString();
      const nextDue = calcNextDueIso(stdFreq, nowIso);
      const statusNorm = normalizeStatus(status);

      // Write a new inspection document (all dates as strings)
      await addDoc(collection(db, "inspections"), {
        componentId,
        assetId: compData.assetId || null,
        date: nowIso,           // human-readable display
        createdAt: nowIso,      // used for sorting (string ISO)
        inspector,
        status: statusNorm,     // "pass" | "fail" | "pending"
        notes: notes || "",
        frequency: stdFreq,     // normalized string
      });

      // Update component summary fields for fast lookups in UI
      await updateDoc(compRef, {
        frequency: stdFreq,
        lastChecked: nowIso,
        nextDue,
        status: statusNorm,
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Quick add save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Quick Add Inspection {componentName ? `— ${componentName}` : ""}
      </DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Result"
          fullWidth
          margin="normal"
          value={status}
          onChange={(e) => setStatus(e.target.value as "Pass" | "Fail")}
        >
          <MenuItem value="Pass">Pass</MenuItem>
          <MenuItem value="Fail">Fail</MenuItem>
        </TextField>

        <TextField
          label="Notes (optional)"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddInspectionModal;
