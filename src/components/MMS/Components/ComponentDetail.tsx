import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";

import EditComponentModal from "./EditComponentModal";
import FindingList from "../Inspections/FindingList";
import RoutineMaintenanceList from "../Inspections/RoutineMaintenanceList";
import InspectionSubmission from "../Inspections/InspectionSubmission";

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
  };
};

const ComponentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 🔑 Added
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  const fetchComponent = async () => {
    if (!id) return;

    try {
      const ref = doc(db, "components", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const componentData = { id: snap.id, ...snap.data() } as ComponentData;

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

      {role !== "guest" && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Findings & Observations
          </Typography>
          <FindingList componentId={component.id} refreshKey={refreshKey} />
        </Paper>
      )}

      {role !== "guest" && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Routine Maintenance
          </Typography>
          <RoutineMaintenanceList componentId={component.id} />
        </Paper>
      )}

      {(role === "admin" || role === "manager") && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Submit New Finding or Maintenance Record
          </Typography>
          <InspectionSubmission
            componentId={component.id}
            assetId={component.assetId}
            assetName={component.assetName}
            onSubmitSuccess={() => setRefreshKey((prev) => prev + 1)} // 🔑 Added
          />
        </Paper>
      )}

      {role === "admin" && component && (
        <EditComponentModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          component={component}
          onSave={handleUpdate}
        />
      )}
    </Box>
  );
};

export default ComponentDetail;
