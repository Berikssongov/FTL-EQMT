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
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { format } from "date-fns";
import { useRole } from "../../../contexts/RoleContext";

import EditComponentModal from "./EditComponentModal";
import AddInspectionForm from "../Inspections/AddInspectionForm";
import InspectionLogTable from "../Inspections/InspectionLogTable";

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
  const [inspectionRefreshTrigger, setInspectionRefreshTrigger] = useState<string>("");
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  const fetchComponent = async () => {
    if (!id) return;

    console.log("🚀 Fetching component data with ID:", id);

    try {
      const ref = doc(db, "components", id);
      const snap = await getDoc(ref);

      console.log("📦 Component data fetched:", snap.exists() ? snap.data() : "No data found");

      if (snap.exists()) {
        const componentData = { id: snap.id, ...snap.data() } as ComponentData;

        // Fetch the asset data based on assetId
        const assetRef = doc(db, "assets", componentData.assetId);
        const assetSnap = await getDoc(assetRef);
        if (assetSnap.exists()) {
          const assetData = assetSnap.data();
          componentData.assetName = assetData?.name; // Add assetName to componentData
        } else {
          console.error("⚠️ Asset not found");
        }

        setComponent(componentData);
      } else {
        console.error("⚠️ Component not found");
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

  console.log("Component Data:", component); // Log for debugging

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Inspection Info
        </Typography>
        <Typography variant="body2">Frequency: {component.inspection.frequency}</Typography>
        <Typography variant="body2">
          Last Checked:{" "}
          {component.inspection.lastChecked
            ? format(new Date(component.inspection.lastChecked), "yyyy-MM-dd")
            : "Not checked"}
        </Typography>
        <Typography variant="body2">
          Next Due:{" "}
          {component.inspection.nextDue
            ? format(new Date(component.inspection.nextDue), "yyyy-MM-dd")
            : "Not scheduled"}
        </Typography>
        <Typography variant="body2">Status: {component.inspection.status}</Typography>
      </Paper>

      {/* Inspection Form and Log Table */}
      <AddInspectionForm
        componentId={component.id}
        componentName={component.name}
        assetId={component.assetId}
        assetName={component.assetName} // Ensure assetName is available here
        currentFrequency={component.inspection.frequency}
        onSaved={() => setInspectionRefreshTrigger(Date.now().toString())}
      />

      <InspectionLogTable
        componentId={component.id}
        refreshTrigger={inspectionRefreshTrigger}
      />

      {/* 🛠️ Edit Modal */}
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
