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
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { format } from "date-fns";

type ComponentData = {
  id: string;
  assetId: string;
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchComponent = async () => {
      try {
        const ref = doc(db, "components", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setComponent({ id: snap.id, ...snap.data() } as ComponentData);
        }
      } catch (err) {
        console.error("Failed to load component", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComponent();
  }, [id]);

  if (loading) {
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
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)}>
        ← Back
      </Button>

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
    </Box>
  );
};

export default ComponentDetail;
