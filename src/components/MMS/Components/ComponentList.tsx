// MMS/Components/ComponentList.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Button } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import AddComponentModal from "./AddComponentModal";
import ComponentCard from "./ComponentCard";

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  status: string;
  assetId: string;
}

const ComponentList: React.FC = () => {
  const { id: assetId } = useParams<{ id: string }>();
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchComponents = async () => {
    const q = query(collection(db, "components"), where("assetId", "==", assetId));
    const snap = await getDocs(q);
    const docs = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ComponentItem, "id">),
    }));
    setComponents(docs);
  };

  useEffect(() => {
    if (assetId) fetchComponents();
  }, [assetId]);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Components</Typography>
        <Button variant="outlined" onClick={() => setModalOpen(true)}>
          Add Component
        </Button>
      </Box>

      <Grid container spacing={2}>
        {components.map((component) => (
          <Grid item xs={12} md={6} key={component.id} {...({} as any)}>
            <ComponentCard
              name={component.name}
              category={component.category}
              status={component.status}
            />
          </Grid>
        ))}
      </Grid>

      <AddComponentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={fetchComponents}
        assetId={assetId || ""}
      />
    </Box>
  );
};

export default ComponentList;
