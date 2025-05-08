// src/components/MMS/Assets/AssetList.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";

import AddAssetModal from "./AddAssetModal"; // We'll build this next

interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  type: string;
}

const CATEGORY_ORDER = [
  "Buildings",
  "Grounds",
  "Fortifications",
  "Grounds Trails",
  "Presentations",
  "Utilities",
];

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const { role } = useRole();

  useEffect(() => {
    const fetchAssets = async () => {
      const snap = await getDocs(collection(db, "assets"));
      const result = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Asset, "id">),
      }));
      setAssets(result);
    };

    fetchAssets();
  }, []);

  const groupedAssets = CATEGORY_ORDER.map((category) => ({
    category,
    items: assets.filter((a) => a.category === category),
  }));

  return (
    <Box sx={{ px: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Assets Overview
        </Typography>
        {role === "admin" && (
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            + Add Asset
          </Button>
        )}
      </Box>

      {groupedAssets.map(({ category, items }) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {category}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {items.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No assets in this category.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {items.map((asset) => (
                <Grid item xs={12} sm={6} md={4} key={asset.id} {...({} as any)}>
                  <Card>
                    <CardContent>
                      <Typography fontWeight={600}>
                        {asset.assetId} — {asset.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Type: {asset.type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ))}

      {/* Modal */}
      <AddAssetModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={() => setOpenAdd(false)} // Temporary for now
      />
    </Box>
  );
};

export default AssetList;
