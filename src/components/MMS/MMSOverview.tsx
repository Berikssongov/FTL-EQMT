/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MMS/MMSOverview.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../contexts/RoleContext";
import AddAssetModal from "./Assets/AddAssetModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // adjust if your Firebase import is different

type Asset = {
  id: string;
  name: string;
  category: string;
  type?: string;
};

const MMSOverview: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { role } = useRole();
  const navigate = useNavigate();

  const handleSaved = () => {
    setOpenModal(false);
    fetchAssets(); // reload assets
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "assets"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Asset[];
      setAssets(data);
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOrder = [
    "Buildings",
    "Grounds",
    "Presentations",
    "Fortifications",
    "Utilities",
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  // Group assets by category
  const groupedAssets = assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    const cat = asset.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {});
  
  // Sort each group alphabetically by asset name
  Object.keys(groupedAssets).forEach(category => {
    groupedAssets[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  
  // Show "Under Construction" page for non-admins
  if (role !== "admin") {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", py: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          🚧 MMS Under Construction
        </Typography>
        <Typography variant="body1">
          This section is currently being developed. Please check back soon for new features related to assets, inspections, and maintenance tracking.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom align="center">
        🏢 MMS Assets Overview
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        [...Object.entries(groupedAssets)]
  .sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b); // Both custom
    if (aIndex === -1) return 1; // a is unknown -> after b
    if (bIndex === -1) return -1; // b is unknown -> after a
    return aIndex - bIndex;
  })
  .map(([category, items]) => (
          <Box key={category} sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {category}
            </Typography>
            <Grid container spacing={2}>
              {items.map(asset => (
                <Grid item xs={12} sm={6} md={4} key={asset.id} {...({} as any)}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: 6, bgcolor: "#f9f9f9" },
                    }}
                    onClick={() => navigate(`/mms/assets/${asset.id}`)}
                  >
                    <Typography variant="subtitle1" fontWeight={500}>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Type: {asset.type || "N/A"}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        onClick={() => setOpenModal(true)}
      >
        <AddIcon />
      </Fab>

      <AddAssetModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={handleSaved}
      />
    </Box>
  );
};

export default MMSOverview;
