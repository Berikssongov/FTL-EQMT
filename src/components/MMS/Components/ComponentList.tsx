// src/components/MMS/Components/ComponentList.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import AddComponentModal from "./AddComponentModal";
import { format } from "date-fns";

type Props = {
  assetId: string;
};

type ComponentItem = {
  id: string;
  name: string;
  type: string;
  location?: string;
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
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
        <Grid container spacing={2}>
          {components.map((comp) => (
            <Grid item xs={12} sm={6} md={4} key={comp.id} {...({} as any)}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  {comp.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {comp.type}
                </Typography>
                {comp.location && (
                  <Typography variant="body2" color="textSecondary">
                    Location: {comp.location}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  Inspection Status: {comp.inspection.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Next Due:{" "}
                  {comp.inspection.nextDue
                    ? format(new Date(comp.inspection.nextDue), "yyyy-MM-dd")
                    : "Not set"}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <AddComponentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchComponents}
        assetId={assetId}
      />
    </Box>
  );
};

export default ComponentList;
