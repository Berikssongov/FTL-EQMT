import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useSnackbar } from "notistack";

import ComponentList from "../Components/ComponentList";

interface Inspection {
  nextDue: string;
}

interface Component {
  id: string;
  assetId: string;
  name: string;
  inspection: Inspection;
}

type Asset = {
  id: string;
  name: string;
  category: string;
  type?: string;
  description?: string;
};

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<Component[]>([]);
  const [dueForInspection, setDueForInspection] = useState<boolean>(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!id) return;

    const fetchAssetAndComponents = async () => {
      setLoading(true);
      try {
        const assetRef = doc(db, "assets", id);
        const assetSnap = await getDoc(assetRef);

        if (assetSnap.exists()) {
          const assetData = { id: assetSnap.id, ...assetSnap.data() } as Asset;
          setAsset(assetData);

          const componentsRef = collection(db, "components");
          const q = query(componentsRef, where("assetId", "==", assetData.id));
          const componentsSnapshot = await getDocs(q);

          const componentsData = componentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Component));

          setComponents(componentsData);

          const now = new Date();
          const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

          let dueFound = false;
          componentsData.forEach((component) => {
            if (component.inspection?.nextDue) {
              const nextDueDate = new Date(component.inspection.nextDue);
              if (nextDueDate <= twoWeeksFromNow && nextDueDate >= now) {
                dueFound = true;
              }
            }
          });

          setDueForInspection(dueFound);
        }
      } catch (error) {
        console.error("Error fetching asset or components:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetAndComponents();
  }, [id]);

  const handleInspection = () => {
    enqueueSnackbar("Starting inspection process for components...", { variant: "info" });
  };

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
          Go Back to Assets
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back to Assets
        </Button>

        {dueForInspection && (
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
            onClick={handleInspection}
          >
            Start Inspection Process
          </Button>
        )}
      </Box>

      <Typography variant="h4" fontWeight={600} sx={{ mt: 2 }}>
        {asset.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Category: {asset.category} • Type: {asset.type || "N/A"}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <ComponentList assetId={asset.id} assetName={asset.name} />
        </Box>
      </Box>
    </Box>
  );
};

export default AssetDetail;
