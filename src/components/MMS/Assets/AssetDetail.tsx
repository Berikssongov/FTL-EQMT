import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import ComponentList from "../Components/ComponentList";

type Asset = {
  id: string;
  name: string;
  category: string;
  type?: string;
  description?: string;
};

const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchAsset = async () => {
      setLoading(true);
      try {
        const assetRef = doc(db, "assets", id);
        const assetSnap = await getDoc(assetRef);
        if (assetSnap.exists()) {
          setAsset({ id: assetSnap.id, ...assetSnap.data() } as Asset);
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!asset) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6">Asset not found.</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)}>
        ← Back to Assets
      </Button>

      <Typography variant="h4" fontWeight={600} sx={{ mt: 2 }}>
        {asset.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Category: {asset.category} • Type: {asset.type || "N/A"}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1">
          {asset.description || "No description available."}
        </Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <ComponentList assetId={asset.id} />
    </Box>
  );
};

export default AssetDetails;
