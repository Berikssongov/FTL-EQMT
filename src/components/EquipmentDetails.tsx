// src/components/EquipmentDetails.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Grid,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { useParams } from "react-router-dom";

import { Equipment, DamageReport } from "../types";
import {
  getEquipmentById,
  updateEquipmentById,
  addDamageReport,
} from "../services/equipmentServices";

const EquipmentDetails: React.FC = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [netWeight, setNetWeight] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [description, setDescription] = useState("");

  const [damage, setDamage] = useState<DamageReport>({
    partName: "",
    partNumber: "",
    supplier1: "",
    price1: "",
    supplier2: "",
    price2: "",
    supplier3: "",
    price3: "",
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      const item = await getEquipmentById(id);
      if (item) {
        setEquipment(item);
        setNetWeight(item.netWeight || "");
        setGrossWeight(item.grossWeight || "");
        setDescription(item.description || "");
      }
      setLoading(false);
    };

    fetchEquipment();
  }, [id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleSaveInfo = async () => {
    if (!id) return;
    await updateEquipmentById(id, {
      netWeight,
      grossWeight,
      description,
    });
    alert("Additional info saved!");
  };

  const handleSaveDamage = async () => {
    if (!id) return;
    await addDamageReport(id, damage);
    alert("Damage report saved!");
    setDamage({
      partName: "",
      partNumber: "",
      supplier1: "",
      price1: "",
      supplier2: "",
      price2: "",
      supplier3: "",
      price3: "",
    });
  };

  if (loading) return <CircularProgress />;
  if (!equipment) return <Typography>No equipment found.</Typography>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={2}>
        {equipment.name}
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Service History" />
          <Tab label="Parts History" />
          <Tab label="Damage Log" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Equipment Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} {...({} as any)}>
            <Grid item xs={12} sm={6} {...({} as any)}>
              <Typography>
                <strong>Make:</strong> {equipment.make}
              </Typography>
              <Typography>
                <strong>Model:</strong> {equipment.modelNumber}
              </Typography>
              <Typography>
                <strong>Serial:</strong> {equipment.serialNumber}
              </Typography>
              <Typography>
                <strong>Category:</strong> {equipment.category}
              </Typography>
              <Typography>
                <strong>Status:</strong> {equipment.status}
              </Typography>
              <Typography>
                <strong>Location:</strong> {equipment.location}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} {...({} as any)}>
              <Typography>
                <strong>License Plate:</strong>{" "}
                {equipment.legal?.licensePlate || "—"}
              </Typography>
              <Typography>
                <strong>Insurance Info:</strong>{" "}
                {equipment.legal?.insuranceInfo || "—"}
              </Typography>
              <Typography>
                <strong>Engine Serial:</strong>{" "}
                {equipment.engine?.serialNumber || "—"}
              </Typography>
              <Typography>
                <strong>Engine Model:</strong>{" "}
                {equipment.engine?.modelNumber || "—"}
              </Typography>
              <Typography>
                <strong>Notes:</strong> {equipment.notes || "—"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Additional Info</Typography>
          <Grid container spacing={2} {...({} as any)}>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Net Weight (kg)"
                fullWidth
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Gross Weight (kg)"
                fullWidth
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveInfo}
            >
              Save Additional Info
            </Button>
          </Box>
        </Paper>
      )}

      {/* Damage Tab */}
      {tab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Damage
          </Typography>

          <Grid container spacing={2} {...({} as any)}>
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Damaged Part Name"
                fullWidth
                value={damage.partName}
                onChange={(e) =>
                  setDamage({ ...damage, partName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Part Number"
                fullWidth
                value={damage.partNumber}
                onChange={(e) =>
                  setDamage({ ...damage, partNumber: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Supplier 1"
                fullWidth
                value={damage.supplier1}
                onChange={(e) =>
                  setDamage({ ...damage, supplier1: e.target.value })
                }
              />
              <TextField
                label="Price"
                type="number"
                fullWidth
                sx={{ mt: 1 }}
                value={damage.price1}
                onChange={(e) =>
                  setDamage({ ...damage, price1: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Supplier 2"
                fullWidth
                value={damage.supplier2}
                onChange={(e) =>
                  setDamage({ ...damage, supplier2: e.target.value })
                }
              />
              <TextField
                label="Price"
                type="number"
                fullWidth
                sx={{ mt: 1 }}
                value={damage.price2}
                onChange={(e) =>
                  setDamage({ ...damage, price2: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={4} {...({} as any)}>
              <TextField
                label="Supplier 3"
                fullWidth
                value={damage.supplier3}
                onChange={(e) =>
                  setDamage({ ...damage, supplier3: e.target.value })
                }
              />
              <TextField
                label="Price"
                type="number"
                fullWidth
                sx={{ mt: 1 }}
                value={damage.price3}
                onChange={(e) =>
                  setDamage({ ...damage, price3: e.target.value })
                }
              />
            </Grid>
          </Grid>

          <Box mt={2}>
            <Button
              variant="contained"
              color="error"
              onClick={handleSaveDamage}
            >
              Save Damage Report
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EquipmentDetails;
