import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItemButton,
  ListItemText,
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
        // Fetch Asset
        const assetRef = doc(db, "assets", id);
        const assetSnap = await getDoc(assetRef);

        if (assetSnap.exists()) {
          const assetData = { id: assetSnap.id, ...assetSnap.data() } as Asset;
          setAsset(assetData);

          // Fetch all components tied to this asset
          const componentsRef = collection(db, "components");
          const q = query(componentsRef, where("assetId", "==", assetData.id));
          const componentsSnapshot = await getDocs(q);

          const componentsData = componentsSnapshot.docs.map((doc) => {
            const componentData = doc.data();
            return {
              id: doc.id,
              ...componentData,
            } as Component;
          });

          setComponents(componentsData);

          // Check for components that need inspection
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
    // Logic to start inspection for the components
    enqueueSnackbar("Starting inspection process for components...", { variant: "info" });
    // Proceed with your inspection process here
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
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back to Assets
        </Button>

        {/* Show the "Start Inspection Process" button beside the Asset name */}
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
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="body1">
              {asset.description || "No description available."}
            </Typography>
          </Paper>

          <Divider sx={{ my: 4 }} />
          <ComponentList assetId={asset.id} assetName={asset.name} />
        </Box>

        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Failed Inspections
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Add logic to display failed inspections here */}
        </Paper>
      </Box>
    </Box>
  );
};

export default AssetDetail;
