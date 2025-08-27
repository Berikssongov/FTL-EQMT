// src/components/MMS/Assets/AssetList.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";
import { useNavigate } from "react-router-dom";

import AddAssetModal from "./AddAssetModal";

interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
}

const CATEGORY_ORDER = [
  "Buildings",
  "Grounds",
  "Fortifications",
  "Presentations",
  "Utilities",
];

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const { role } = useRole();
  const navigate = useNavigate();

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

  // Group + alphabetize assets
  const groupedAssets = CATEGORY_ORDER.map((category) => ({
    category,
    items: assets
      .filter((a) => a.category === category)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <Box sx={{ px: 2 }}>
      {/* Header */}
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

      {/* Categories */}
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
            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))"
              gap={1}
            >
              {items.map((asset) => (
                <Box
                  key={asset.id}
                  onClick={() => navigate(`/mms/assets/${asset.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <Card
                    sx={{
                      transition: "0.2s",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                      minHeight:75,
                      maxHeight: 75,
                    }}
                  >
                    <CardContent sx={{ padding: "4px 16px" }}>
                      <Typography fontWeight={600}>{asset.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Type: {asset.type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}

      {/* Modal */}
      <AddAssetModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={() => setOpenAdd(false)}
      />
    </Box>
  );
};

export default AssetList;
