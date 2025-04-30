import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useNavigate } from "react-router-dom";
import { Equipment, EquipmentServiceRecord, EquipmentPart } from "../types";
import { getEquipmentById } from "../services/equipmentServices";
import { fetchServiceRecordsByEquipmentId } from "../services/serviceRecordsService";
import { fetchPartRecordsByEquipmentId } from "../services/partsRecordsService";

import EquipmentEditModal from "./EquipmentEditModal";
import AddServiceModal from "./AddServiceModal";
import AddPartModal from "./AddPartModal";

import { ServiceRecord } from "../types"; // ✅ this must be present


const EquipmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [partOpen, setPartOpen] = useState(false);
  const [services, setServices] = useState<EquipmentServiceRecord[]>([]);
  const [parts, setParts] = useState<EquipmentPart[]>([]);

  useEffect(() => {
    if (id) {
      loadEquipment(id);
      loadServices(id);
      loadParts(id);
    }
  }, [id]);

  const loadEquipment = async (equipmentId: string) => {
    const data = await getEquipmentById(equipmentId);
    setEquipment(data || null);
    setLoading(false);
  };

  const loadServices = async (equipmentId: string) => {
    const data = await fetchServiceRecordsByEquipmentId(equipmentId);
    const formatted = data.map((svc) => ({
      id: svc.id || "",
      equipmentId: svc.equipmentId,
      date: svc.date,
      summary: svc.summary || "",
      totalCost: svc.totalCost ?? 0,
      items: svc.items || [],
    }));
    setServices(formatted);
  };

  const loadParts = async (equipmentId: string) => {
    const data = await fetchPartRecordsByEquipmentId(equipmentId);
    const formatted = data.map((part) => ({
      id: part.id || "",
      equipmentId: part.equipmentId,
      name: part.partName || "",
      partNumber: part.partNumber || "",
      vendor: part.vendor || "",
      price: part.price ?? 0,
    }));
    setParts(formatted);
  };

  const reloadAll = () => {
    if (id) {
      loadEquipment(id);
      loadServices(id);
      loadParts(id);
    }
  };

  if (loading) return <CircularProgress />;
  if (!equipment) return <Typography>Equipment not found.</Typography>;

  return (
    <Box>
      <Button onClick={() => navigate("/equipment")} sx={{ mb: 2 }}>
        ← Back to Equipment List
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            {equipment.name}
          </Typography>
          <IconButton onClick={() => setEditOpen(true)} color="primary">
            <EditIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2} {...({} as any)}>
          <Grid item xs={12} md={6} {...({} as any)}>
            <Typography><strong>Category:</strong> {equipment.category}</Typography>
            <Typography><strong>Make:</strong> {equipment.make}</Typography>
            <Typography><strong>Model #:</strong> {equipment.modelNumber}</Typography>
            <Typography><strong>Serial #:</strong> {equipment.serialNumber}</Typography>
            <Typography><strong>Status:</strong> {equipment.status}</Typography>
            <Typography><strong>Condition:</strong> {equipment.condition}</Typography>
            <Typography><strong>Location:</strong> {equipment.location}</Typography>
          </Grid>

          <Grid item xs={12} md={6} {...({} as any)}>
            {equipment.legal && (equipment.legal.licensePlate || equipment.legal.insuranceInfo) && (
              <>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                  Legal Information
                </Typography>
                {equipment.legal.licensePlate && (
                  <Typography><strong>License Plate:</strong> {equipment.legal.licensePlate}</Typography>
                )}
                {equipment.legal.insuranceInfo && (
                  <Typography><strong>Insurance Info:</strong> {equipment.legal.insuranceInfo}</Typography>
                )}
              </>
            )}

            {equipment.engine && (equipment.engine.serialNumber || equipment.engine.modelNumber) && (
              <>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                  Engine Information
                </Typography>
                {equipment.engine.serialNumber && (
                  <Typography><strong>Engine Serial #:</strong> {equipment.engine.serialNumber}</Typography>
                )}
                {equipment.engine.modelNumber && (
                  <Typography><strong>Engine Model #:</strong> {equipment.engine.modelNumber}</Typography>
                )}
              </>
            )}

            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              Specifications & Notes
            </Typography>
            {(equipment as any).weightCapacity && (
              <Typography>
                <strong>Weight Capacity:</strong> {(equipment as any).weightCapacity} lbs
              </Typography>
            )}
            {(equipment as any).towingCapacity && (
              <Typography>
                <strong>Towing Capacity:</strong> {(equipment as any).towingCapacity} lbs
              </Typography>
            )}
            {equipment.notes && (
              <Typography><strong>Notes:</strong> {equipment.notes}</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
  {/* Service History */}
  <Box sx={{ flex: "1 1 48%", minWidth: "300px" }}>
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Service History</Typography>
        <Button variant="outlined" size="small" onClick={() => setServiceOpen(true)}>
          + Add
        </Button>
      </Box>

      {services.length === 0 ? (
        <Typography color="textSecondary">No service records yet.</Typography>
      ) : (
        services.map((svc) => (
          <Box
            key={svc.id}
            sx={{
              mb: 2,
              p: 1.5,
              border: "1px solid #ccc",
              borderRadius: 1,
              cursor: "pointer",
              transition: "0.2s ease",
              "&:hover": { backgroundColor: "#f9f9f9" },
            }}
            onClick={() => navigate(`/service/${svc.id}`)}
          >
            <Typography fontWeight={600}>
              {svc.summary || "Service Entry"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(svc.date).toLocaleDateString()}
            </Typography>
            {svc.totalCost > 0 && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Total:</strong> ${svc.totalCost.toFixed(2)}
              </Typography>
            )}
          </Box>
        ))
      )}
    </Paper>
  </Box>

  {/* Parts */}
  <Box sx={{ flex: "1 1 48%", minWidth: "300px" }}>
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Parts</Typography>
        <Button variant="outlined" size="small" onClick={() => setPartOpen(true)}>
          + Add
        </Button>
      </Box>

      {parts.length === 0 ? (
        <Typography color="textSecondary">No parts recorded yet.</Typography>
      ) : (
        parts.map((part) => (
          <Box
            key={part.id}
            sx={{
              mb: 2,
              p: 1.5,
              border: "1px solid #ccc",
              borderRadius: 1,
              cursor: "pointer",
              transition: "0.2s ease",
              "&:hover": { backgroundColor: "#f9f9f9" },
            }}
            onClick={() => navigate(`/parts/${part.id}`)}
          >
            <Typography fontWeight={600}>{part.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Part #: {part.partNumber || "N/A"} — ${part.price?.toFixed(2) || "—"}
            </Typography>
            {part.vendor && (
              <Typography variant="body2" color="textSecondary">
                Vendor: {part.vendor}
              </Typography>
            )}
          </Box>
        ))
      )}
    </Paper>
  </Box>
</Box>


      {/* Modals */}
      {editOpen && equipment && (
        <EquipmentEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          equipment={equipment}
          onSaved={reloadAll}
        />
      )}

      {serviceOpen && (
        <AddServiceModal
          open={serviceOpen}
          onClose={() => setServiceOpen(false)}
          equipmentId={id!}
          onSaved={reloadAll}
        />
      )}

      {partOpen && (
        <AddPartModal
          open={partOpen}
          onClose={() => setPartOpen(false)}
          equipmentId={id!}
          onSaved={reloadAll}
        />
      )}
    </Box>
  );
};

export default EquipmentDetails;
