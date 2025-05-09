import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import AddComponentModal from "./AddComponentModal";
import { format } from "date-fns";

type Props = {
  assetId: string;
  assetName: string;
};

type ComponentItem = {
  id: string;
  name: string;
  type: string;
  location?: string;
  category?: string;
  condition?: string;
  inspection: {
    frequency: string;
    lastChecked: string | null;
    nextDue: string | null;
    status: string;
  };
};

const ComponentList: React.FC<Props> = ({ assetId }) => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "components");
      const q = query(ref, where("assetId", "==", assetId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ComponentItem[];
      setComponents(list);
    } catch (err) {
      console.error("Error loading components:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [assetId]);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">🧩 Components</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add Component
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : components.length === 0 ? (
        <Typography color="textSecondary">No components found.</Typography>
      ) : (
        <Box>
          {components.map((comp) => (
            <Paper
              key={comp.id}
              sx={{
                p: 2,
                mb: 2,
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => navigate(`/components/${comp.id}`)}
            >
              <Typography
                variant="subtitle1"
                fontWeight={500}
                color={comp.inspection?.status === "fail" ? "error" : "textPrimary"}
              >
                {comp.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Type: {comp.type} • Category: {comp.category} • Location: {comp.location}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Condition: {comp.condition} • Next Inspection:{" "}
                {comp.inspection?.nextDue
                  ? format(new Date(comp.inspection.nextDue), "yyyy-MM-dd")
                  : "Not set"}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <AddComponentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchComponents();
        }}
        assetId={assetId}
      />
    </Box>
  );
};

export default ComponentList;
