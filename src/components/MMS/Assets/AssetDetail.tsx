import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton, // Import ListItemButton
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import ComponentList from "../Components/ComponentList";
import { Timestamp } from "firebase/firestore"; // Import Timestamp from Firebase

interface Inspection {
  id: string;
  componentName: string;
  assetName: string;
  timestamp: Timestamp | null; // Allow timestamp to be null
  status: string;
  notes: string; // Added field to store inspection notes
  componentId: string; // Assuming we have this to navigate to the component
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
  const [failedInspections, setFailedInspections] = useState<Inspection[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchAssetAndInspections = async () => {
      setLoading(true);
      try {
        const assetRef = doc(db, "assets", id);
        const assetSnap = await getDoc(assetRef);
    
        if (assetSnap.exists()) {
          const assetData = { id: assetSnap.id, ...assetSnap.data() } as Asset;
          setAsset(assetData);
    
          const inspectionsRef = collection(db, "componentInspections");
          const q = query(
            inspectionsRef,
            where("assetId", "==", assetData.id),
            where("status", "==", "fail")
          );
          const snapshot = await getDocs(q);
    
          const failed = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Fetched inspection data:", data); // Log the fetched data
    
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp ?? null, // Handle timestamp correctly
              notes: data.notes, // Store the notes
              componentId: data.componentId, // Store the component ID
            };
          }) as Inspection[];
    
          failed.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
          setFailedInspections(failed);
        }
      } catch (error) {
        console.error("Error fetching asset or inspections:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssetAndInspections();
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
          {failedInspections.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No failed inspections for this asset.
            </Typography>
          ) : (
            <List dense>
              {failedInspections.map((inspection) => (
                <ListItemButton
                  key={inspection.id}
                  onClick={() => navigate(`/components/${inspection.componentId}`)} // Navigate to the component details
                >
                  <ListItemText
                    primary={`${inspection.assetName} - ${inspection.componentName}`}
                    secondary={
                      <>
                        <span>{inspection.notes}</span> {/* Replace div with span */}
                        <span>
                          {inspection.timestamp
                            ? new Date(inspection.timestamp.seconds * 1000).toLocaleString() // Convert timestamp to date
                            : "No date available"}
                        </span>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AssetDetail;
