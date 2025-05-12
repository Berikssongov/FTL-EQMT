import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Slider,
  Paper,
} from "@mui/material";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { format } from "date-fns";
import { auth } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";
import { useAuth } from "../../../contexts/AuthContext";  // Importing useAuth to access user info

type Props = {
  componentId: string;
  assetId: string;
  assetName: string;
  onSubmitSuccess?: () => void;
};

const InspectionSubmission: React.FC<Props> = ({
  componentId,
  assetId,
  assetName,
  onSubmitSuccess,
}) => {
  const [finding, setFinding] = useState("");
  const [cause, setCause] = useState("");
  const [impact, setImpact] = useState<number>(0);
  const [actionItem, setActionItem] = useState("");
  const [status, setStatus] = useState("open");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { role, loading: roleLoading } = useRole();
  const { firstName, lastName } = useAuth();  // Accessing firstName and lastName from AuthContext

  const inspectorName = `${firstName} ${lastName}`;

  const handleSubmit = async () => {
    if (!finding || !cause) return; // Ensure finding and cause are provided before submitting
    setSubmitting(true);

    try {
      // Prepare payload to submit to Firestore
      const payload = {
        componentId,
        assetId,
        assetName,
        finding,
        cause,
        impact,
        actionItem,
        status,
        inspectorName,
        date: format(new Date(), "yyyy-MM-dd HH:mm:ss"), // Formatting date as "yyyy-MM-dd HH:mm:ss"
        timestamp: Timestamp.now(), // Using Firestore timestamp
      };

      // Submit to the "findings" collection in Firestore
      await addDoc(collection(db, "findings"), payload);

      // Reset the form fields and display success message
      setSuccessMsg("Finding submitted successfully.");
      setFinding("");
      setCause("");
      setImpact(0);
      setActionItem("");
      setStatus("open");

      // Call the optional onSubmitSuccess callback if provided
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error("Error submitting finding:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Success message display */}
      {successMsg && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {successMsg}
        </Typography>
      )}

      {/* Finding / Observation input */}
      <TextField
        fullWidth
        label="Finding / Observation"
        value={finding}
        onChange={(e) => setFinding(e.target.value)}
        sx={{ mb: 2 }}
        multiline
        required
      />

      {/* Possible Cause input */}
      <TextField
        fullWidth
        label="Possible Cause"
        value={cause}
        onChange={(e) => setCause(e.target.value)}
        sx={{ mb: 2 }}
        multiline
        required
      />

      {/* Impact slider */}
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Impact on Component Condition</Typography>
        <Slider
          value={impact}
          onChange={(_, newValue) => setImpact(newValue as number)}
          min={0}
          max={10}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Recommended Action input (Optional) */}
      <TextField
        fullWidth
        label="Recommended Action (Optional)"
        value={actionItem}
        onChange={(e) => setActionItem(e.target.value)}
        sx={{ mb: 2 }}
        multiline
      />

      {/* Status selection */}
      <TextField
        select
        fullWidth
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="open">Open</MenuItem>
        <MenuItem value="in_progress">In Progress</MenuItem>
        <MenuItem value="resolved">Resolved</MenuItem>
      </TextField>

      {/* Submit button */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Finding"}
      </Button>
    </Paper>
  );
};

export default InspectionSubmission;
