import React, { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";
import { useAuth } from "../../../contexts/AuthContext";  // Importing useAuth to access user info

interface Props {
  componentId: string;
  componentName: string;
  assetId: string;
  assetName: string; // Automatically passed from ComponentDetail
  currentFrequency: string;
  onSaved: () => void;
}

const AddInspectionForm: React.FC<Props> = ({
  componentId,
  componentName,
  assetId,
  assetName, // Automatically passed from ComponentDetail
  currentFrequency,
  onSaved,
}) => {
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pass");
  const [saving, setSaving] = useState(false);

  const { role, loading: roleLoading } = useRole();
  const { firstName, lastName } = useAuth();  // Accessing firstName and lastName from AuthContext

  // If the role data is still loading, show a loading spinner
  if (roleLoading) return <CircularProgress />;

  // Block access for users who are not admins or managers
  if (!["admin", "manager"].includes(role)) {
    console.warn("⛔ Blocked access - user is not admin or manager");
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body2" color="error">
          You do not have permission to log inspections.
        </Typography>
      </Paper>
    );
  }

  // Check if user information is available
  if (!firstName || !lastName) {
    console.warn("⛔ User information not found!");
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body2" color="error">
          Unable to retrieve your user information.
        </Typography>
      </Paper>
    );
  }

  // Combine firstName and lastName to create the full inspector name
  const inspectorName = `${firstName} ${lastName}`;

  const calculateNextDue = (frequency: string): string => {
    const now = new Date();
    const base = new Date(now);
    switch (frequency) {
      case "daily": base.setDate(base.getDate() + 1); break;
      case "weekly": base.setDate(base.getDate() + 7); break;
      case "monthly": base.setMonth(base.getMonth() + 1); break;
      case "quarterly": base.setMonth(base.getMonth() + 3); break;
      case "yearly": base.setFullYear(base.getFullYear() + 1); break;
      default: base.setDate(base.getDate() + 30);
    }
    return base.toISOString();
  };

  const handleSubmit = async () => {
    if (!inspectorName || !notes) {
      console.warn("⛔ Missing required fields");
      return;
    }
  
    if (!assetName) {
      console.warn("⛔ assetName is missing!");
      return;
    }
  
    console.log("🟢 Submitting inspection...");
    console.log("📦 Data:", { inspectorName, notes, status, assetName });
  
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const nextDue = calculateNextDue(currentFrequency);
      console.log("🗓️ Next due calculated as:", nextDue);
  
      const inspectionRef = await addDoc(collection(db, "componentInspections"), {
        componentId,
        componentName,
        assetId,
        assetName, // Automatically included
        inspector: inspectorName,  // Use the full name of the inspector
        notes,
        status,
        date: serverTimestamp(),
      });
      console.log("✅ Inspection saved with ID:", inspectionRef.id);
  
      await updateDoc(doc(db, "components", componentId), {
        inspection: {
          frequency: currentFrequency,
          lastChecked: now,
          nextDue,
          status,
        },
      });
  
      setNotes("");
      setStatus("pass");
      onSaved();
  
    } catch (err) {
      console.error("❌ Failed to save inspection:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Mark Inspection as Done
      </Typography>
      <Stack spacing={2}>
        {/* Remove the Inspector Name field */}
        <TextField
          label="Notes"
          value={notes}
          multiline
          rows={3}
          onChange={(e) => setNotes(e.target.value)}
          size="small"
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
        >
          <MenuItem value="pass">Pass</MenuItem>
          <MenuItem value="fail">Fail</MenuItem>
        </TextField>

        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          Save Inspection
        </Button>
      </Stack>
    </Paper>
  );
};

export default AddInspectionForm;
