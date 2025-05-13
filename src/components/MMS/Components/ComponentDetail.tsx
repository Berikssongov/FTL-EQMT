import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";

import EditComponentModal from "./EditComponentModal";

type ComponentData = {
  id: string;
  assetId: string;
  assetName: string;
  name: string;
  type: string;
  category: string;
  location: string;
  condition: string;
  tags: string[];
  inspection: {
    frequency: string;
    lastChecked: string | null;
    nextDue: string | null;
    status: string;
    findings: string | string[]; // Update to handle both types
  };
};

const ComponentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [inspectionStatus, setInspectionStatus] = useState<string | null>(null);
  const [currentFinding, setCurrentFinding] = useState("");
  const [findings, setFindings] = useState<string[]>([]);
  const [addingFinding, setAddingFinding] = useState(false);
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  const fetchComponent = async () => {
    if (!id) return;

    try {
      const ref = doc(db, "components", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const componentData = { id: snap.id, ...snap.data() } as ComponentData;

        if (componentData.inspection.nextDue) {
          const nextDueDate = new Date(componentData.inspection.nextDue).toISOString();
          componentData.inspection.nextDue = nextDueDate;
        }

        const assetRef = doc(db, "assets", componentData.assetId);
        const assetSnap = await getDoc(assetRef);
        if (assetSnap.exists()) {
          const assetData = assetSnap.data();
          componentData.assetName = assetData?.name;
        }

        setComponent(componentData);
      }
    } catch (err) {
      console.error("❌ Failed to load component:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponent();
  }, [id]);

  const handleUpdate = async (updated: Partial<ComponentData>) => {
    if (!id) return;
    try {
      const ref = doc(db, "components", id);
      await updateDoc(ref, updated);
      setComponent((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update component", err);
    }
  };

  const handleInspectionSubmit = async (status: string) => {
    if (!id || !component || (role !== "admin" && role !== "manager")) {
      console.log("❌ You do not have permission to submit this inspection.");
      return;
    }

    // Calculate the new next due date based on the frequency
    const now = new Date();
    const newNextDue = new Date(now); // clone current date
    const freq = component.inspection.frequency.toLowerCase();

    switch (freq) {
      case "monthly":
        newNextDue.setMonth(newNextDue.getMonth() + 1);
        break;
      case "quarterly":
        newNextDue.setMonth(newNextDue.getMonth() + 3);
        break;
      case "semi-annually":
      case "biannually":
        newNextDue.setMonth(newNextDue.getMonth() + 6);
        break;
      case "yearly":
      case "annually":
        newNextDue.setFullYear(newNextDue.getFullYear() + 1);
        break;
      default:
        // if unknown or not set, leave nextDue unchanged or set to null
        console.warn("⚠️ Unknown frequency:", freq);
        break;
    }

    const updatedInspection = {
      ...component.inspection,
      status,
      lastChecked: now.toISOString(),
      nextDue: isNaN(newNextDue.getTime()) ? null : newNextDue.toISOString(),
      findings: status === "no" ? findings : [],
    };

    await handleUpdate({
      inspection: updatedInspection,
    });

    // Reset state
    setInspectionStatus(null);
    setFindings([]);
    setCurrentFinding("");
    setAddingFinding(false);
  };

  const isInspectionDue = (nextDue: string | null): boolean => {
    if (!nextDue || nextDue === "Not set") return true;
    const currentDate = new Date();
    const dueDate = new Date(nextDue);
    if (isNaN(dueDate.getTime())) return false;

    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const fourteenDays = 1000 * 60 * 60 * 24 * 14;

    return dueDate <= currentDate || timeDiff <= fourteenDays;
  };

  if (loading || roleLoading) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!component) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6">Component not found.</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        {role === "admin" && (
          <Button variant="contained" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        )}
      </Box>

      <Typography variant="h4" fontWeight={600} sx={{ mt: 2 }}>
        {component.name}
      </Typography>

      <Typography variant="subtitle1" color="textSecondary">
        Type: {component.type} • Category: {component.category} • Location: {component.location}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Condition
        </Typography>
        <Chip label={component.condition} color="primary" />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Tags
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {component.tags.map((tag, i) => (
            <Chip key={i} label={tag} />
          ))}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {role !== "guest" && component.inspection?.frequency && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Inspection Frequency & Next Due
          </Typography>
          <Typography>
            Frequency: {component.inspection.frequency}
          </Typography>
          <Typography>
            Next Due: {component.inspection.nextDue || "Not set"}
          </Typography>

          {isInspectionDue(component.inspection.nextDue) && inspectionStatus === null && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setInspectionStatus("pending")}
              >
                Inspect
              </Button>
            </Box>
          )}

          {inspectionStatus === "pending" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Did the component pass inspection?
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={() => setInspectionStatus("yes")}
                sx={{ mr: 2 }}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setInspectionStatus("no");
                  setAddingFinding(true);
                }}
              >
                No
              </Button>
            </Box>
          )}

{inspectionStatus === "yes" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 2 }}>
      This inspection will be submitted as <strong>PASSED</strong>.
    </Typography>
    <Button
      variant="contained"
      color="success"
      onClick={() => handleInspectionSubmit("yes")}
    >
      Submit Passed Inspection
    </Button>
  </Box>
)}

{inspectionStatus === "no" && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">Please add findings:</Typography>

    {addingFinding && (
      <>
        <TextField
          fullWidth
          variant="outlined"
          label="Finding"
          value={currentFinding}
          onChange={(e) => setCurrentFinding(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={() => {
            if (currentFinding.trim()) {
              setFindings([...findings, currentFinding.trim()]);
              setCurrentFinding("");
              setAddingFinding(false);
            }
          }}
          sx={{ mb: 2 }}
        >
          Add Finding
        </Button>
      </>
    )}

    {!addingFinding && (
      <>
        {findings.length > 0 && (
          <>
            <Typography variant="subtitle2">Findings:</Typography>
            <ul>
              {findings.map((finding, idx) => (
                <li key={idx}>{finding}</li>
              ))}
            </ul>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setAddingFinding(true)}
                sx={{ mr: 2 }}
              >
                Add Another Finding
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleInspectionSubmit("no")}
              >
                Submit Failed Inspection with Findings
              </Button>
            </Box>
          </>
        )}

        {findings.length === 0 && (
          <Button variant="contained" onClick={() => setAddingFinding(true)}>
            Add First Finding
          </Button>
        )}
      </>
    )}
  </Box>
)}

          {findings.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Findings:</Typography>
              {findings.map((finding, index) => (
                <Typography key={index} sx={{ mb: 1 }}>
                  - {finding}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}
      
      {Array.isArray(component.inspection?.findings) &&
  component.inspection.findings.length > 0 && (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Saved Inspection Findings
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        These findings were reported during the last failed inspection.
      </Typography>
      <Box>
  {(component.inspection.findings as string[]).map((finding, idx) => (
    <Paper
      key={idx}
      elevation={1}
      sx={{
        p: 2,
        mb: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
      onClick={() => {
        // Placeholder for future logic (e.g., open modal with details)
        console.log(`Clicked finding #${idx + 1}:`, finding);
      }}
    >
      <Typography variant="body1">
        {idx + 1}. {finding}
      </Typography>
    </Paper>
  ))}
</Box>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        Last Checked:{" "}
        {component.inspection.lastChecked
          ? new Date(component.inspection.lastChecked).toLocaleDateString()
          : "N/A"}
      </Typography>
    </Paper>
)}



<EditComponentModal
  open={editOpen}
  component={component}
  onClose={() => setEditOpen(false)}
  onSave={handleUpdate}  // <-- this stays the same!
/>

    </Box>
  );
};

export default ComponentDetail;
