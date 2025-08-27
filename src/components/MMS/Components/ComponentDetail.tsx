import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";

import EditComponentModal from "./EditComponentModal";

export type ComponentData = {
  id: string;
  assetId: string;
  assetName?: string;
  name: string;
  type: string;
  category: string;
  location: string;
  condition: string;
  tags: string[];
  frequency?: string; // inspection frequency now stored here
};

type Inspection = {
  id: string;
  componentId: string;
  createdAt?: string; // ISO string
  date?: string;      // ISO string
  status?: string;    // "pass" | "fail" | "pending"
  inspector?: string;
  notes?: string;
};

const frequencyOptions: { value: string; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "5-years", label: "Every 5 Years" },
];

// safe ISO formatter
const fmt = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.valueOf()) ? iso : d.toLocaleDateString();
};

const ComponentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  const fetchComponent = async () => {
    if (!id) return;
    try {
      const ref = doc(db, "components", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const componentData = { id: snap.id, ...snap.data() } as ComponentData;

        // Fetch asset name
        if (componentData.assetId) {
          const assetRef = doc(db, "assets", componentData.assetId);
          const assetSnap = await getDoc(assetRef);
          if (assetSnap.exists()) {
            const assetData = assetSnap.data();
            componentData.assetName = (assetData as any)?.name;
          }
        }

        setComponent(componentData);
      } else {
        setComponent(null);
      }
    } catch (err) {
      console.error("❌ Failed to load component:", err);
      setComponent(null);
    }
  };

  const fetchInspections = async () => {
    if (!id) return;
    try {
      // equality filter only; sort client-side so we don't need indexes or Timestamps
      const ref = collection(db, "inspections");
      const qy = query(ref, where("componentId", "==", id));
      const snap = await getDocs(qy);

      const list: Inspection[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          componentId: data.componentId,
          createdAt: data.createdAt,
          date: data.date,
          status: data.status,
          inspector: data.inspector,
          notes: data.notes,
        };
      });

      // sort by createdAt or date (both are ISO strings). We sort by string desc,
      // but also try Date parse for safety if possible.
      list.sort((a, b) => {
        const av = a.createdAt || a.date || "";
        const bv = b.createdAt || b.date || "";
        // try Date compare first
        const ad = new Date(av).valueOf();
        const bd = new Date(bv).valueOf();
        if (!isNaN(ad) && !isNaN(bd)) return bd - ad;
        // fallback to lexicographic (ISO sorts chronologically)
        return bv.localeCompare(av);
      });

      setInspections(list);
    } catch (err) {
      console.error("❌ Failed to load inspections:", err);
      setInspections([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchComponent(), fetchInspections()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const freqLabel =
    component.frequency
      ? frequencyOptions.find((opt) => opt.value === component.frequency)?.label || component.frequency
      : "Not set";

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
          {component.tags?.map((tag, i) => (
            <Chip key={i} label={tag} />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Inspection Frequency
        </Typography>
        <Typography>{freqLabel}</Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom>
            Recent Inspections
          </Typography>
          <MuiLink
            component="button"
            variant="body2"
            onClick={() => navigate(`/mms/components/${component.id}/inspections`)}
            sx={{ textDecoration: "none" }}
          >
            View all
          </MuiLink>
        </Box>

        {inspections.length === 0 ? (
          <Typography color="textSecondary">No inspections yet.</Typography>
        ) : (
          <List dense>
            {inspections.slice(0, 5).map((ins) => (
              <ListItem key={ins.id} disableGutters>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        size="small"
                        label={(ins.status || "pending").toUpperCase()}
                        color={
                          ins.status === "pass" ? "success" : ins.status === "fail" ? "error" : "default"
                        }
                      />
                      <Typography variant="body2">
                        {fmt(ins.createdAt || ins.date)} — {ins.inspector || "Unknown"}
                      </Typography>
                    </Box>
                  }
                  secondary={ins.notes || ""}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <EditComponentModal
        open={editOpen}
        component={component}
        onClose={() => setEditOpen(false)}
        onSave={(updated) =>
          setComponent((prev) => (prev ? { ...prev, ...updated } : prev))
        }
      />
    </Box>
  );
};

export default ComponentDetail;
