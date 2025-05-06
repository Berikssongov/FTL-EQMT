import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  assetId?: string;
}

const AddComponentModal: React.FC<Props> = ({ open, onClose, onAdded, assetId }) => {
  const [form, setForm] = useState({
    name: "",
    type: "",
    condition: "",
    assetId: assetId || "",
    notes: "",
  });

  const [assetOptions, setAssetOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      const snapshot = await getDocs(collection(db, "assets"));
      const options = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setAssetOptions(options);
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (assetId) {
      setForm((prev) => ({ ...prev, assetId }));
    }
  }, [assetId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.condition || !form.assetId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "components"), {
        ...form,
        createdAt: new Date().toISOString(),
      });

      if (onAdded) onAdded();

      onClose();
      setForm({ name: "", type: "", condition: "", assetId: "", notes: "" });
    } catch (error) {
      console.error("Failed to add component:", error);
      alert("An error occurred while saving the component.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 10,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Add New Component
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Component Name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Component Type"
                name="type"
                value={form.type}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Condition"
                name="condition"
                value={form.condition}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} {...({} as any)}>
              <FormControl fullWidth>
                <InputLabel id="asset-select-label">Linked Asset</InputLabel>
                <Select
                  labelId="asset-select-label"
                  name="assetId"
                  value={form.assetId}
                  label="Linked Asset"
                  onChange={handleSelectChange}
                >
                  {assetOptions.map((asset) => (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} {...({} as any)}>
              <Button variant="contained" fullWidth onClick={handleSubmit}>
                Save Component
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Modal>
  );
};

export default AddComponentModal;
