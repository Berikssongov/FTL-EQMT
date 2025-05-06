// MMS/Assets/AssetDetail.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import ComponentList from "../Components/ComponentList"; // add this import

interface Asset {
  name: string;
  assetNumber: string;
  category: string;
}

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAsset = async () => {
    if (!id) return;
    const ref = doc(db, "assets", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setAsset(snap.data() as Asset);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  if (loading) return <CircularProgress />;

  if (!asset) return <Typography>Asset not found.</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        {asset.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        #{asset.assetNumber} — {asset.category}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography>More detail sections can go here.</Typography>
    </Box>
  );
};

export default AssetDetail;
<ComponentList />
