// MMS/Assets/AssetList.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import AddAssetModal from "./AddAssetModal";
import { useNavigate } from "react-router-dom";

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  category: string;
}

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAssets = async () => {
    const snap = await getDocs(collection(db, "assets"));
    const docs = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Asset, "id">),
    }));
    setAssets(docs);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Asset List
        </Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add Asset
        </Button>
      </Box>

      <Grid container spacing={2} {...({} as any)}>
        {assets.map((asset) => (
          <Grid item xs={12} md={6} lg={4} key={asset.id} {...({} as any)}>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/mms/assets/${asset.id}`)}
            >
              <CardContent>
                <Typography variant="h6">{asset.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  #{asset.assetNumber} • {asset.category}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <AddAssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={fetchAssets}
      />
    </Box>
  );
};

export default AssetList;
