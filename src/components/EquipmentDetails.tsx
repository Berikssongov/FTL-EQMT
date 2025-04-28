// src/components/EquipmentDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";

import { Equipment } from "../types";
import { getEquipmentById } from "../services/equipmentServices";
import { fetchServiceRecordsByEquipmentId } from "../services/serviceRecordsService";
import { ServiceRecord } from "../services/serviceRecordsService";
import { fetchPartRecordsByEquipmentId } from "../services/partsRecordsService";
import { PartRecord } from "../services/partsRecordsService";

import EquipmentEditModal from "./EquipmentEditModal";
import ServiceRecordForm from "./ServiceRecordForm";
import PartsRecordForm from "./PartsRecordForm";

const EquipmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);

  const [partRecords, setPartRecords] = useState<PartRecord[]>([]);
  const [partsFormOpen, setPartsFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEquipment();
      fetchServiceHistory();
      fetchPartsHistory();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      if (!id) return;
      const item = await getEquipmentById(id);
      setEquipment(item);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceHistory = async () => {
    if (!id) return;
    try {
      const records = await fetchServiceRecordsByEquipmentId(id);
      setServiceRecords(records);
    } catch (error) {
      console.error("Error fetching service history:", error);
    }
  };

  const fetchPartsHistory = async () => {
    if (!id) return;
    try {
      const parts = await fetchPartRecordsByEquipmentId(id);
      setPartRecords(parts);
    } catch (error) {
      console.error("Error fetching parts history:", error);
    }
  };

  if (loading) return <CircularProgress />;
  if (!equipment) return <Typography>No equipment found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Button variant="outlined" onClick={() => navigate("/equipment")}>
          Back to Equipment List
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
      </Stack>

      {/* Equipment Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          {equipment.name}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Core Fields */}
        <Box sx={{ mb: 2 }}>
          <Typography>
            <strong>Category:</strong> {equipment.category}
          </Typography>
          <Typography>
            <strong>Make:</strong> {equipment.make}
          </Typography>
          <Typography>
            <strong>Model Number:</strong> {equipment.modelNumber}
          </Typography>
          <Typography>
            <strong>Serial Number:</strong> {equipment.serialNumber}
          </Typography>
          <Typography>
            <strong>Status:</strong> {equipment.status}
          </Typography>
          <Typography>
            <strong>Location:</strong> {equipment.location}
          </Typography>
          {equipment.notes && (
            <Typography>
              <strong>Notes:</strong> {equipment.notes}
            </Typography>
          )}
        </Box>

        {/* Optional Legal Info */}
        {equipment.legal &&
          (equipment.legal.licensePlate || equipment.legal.insuranceInfo) && (
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Legal Info
              </Typography>
              {equipment.legal.licensePlate && (
                <Typography>
                  <strong>License Plate:</strong> {equipment.legal.licensePlate}
                </Typography>
              )}
              {equipment.legal.insuranceInfo && (
                <Typography>
                  <strong>Insurance Info:</strong>{" "}
                  {equipment.legal.insuranceInfo}
                </Typography>
              )}
            </Box>
          )}

        {/* Optional Engine Info */}
        {equipment.engine &&
          (equipment.engine.serialNumber || equipment.engine.modelNumber) && (
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Engine Info
              </Typography>
              {equipment.engine.serialNumber && (
                <Typography>
                  <strong>Engine Serial Number:</strong>{" "}
                  {equipment.engine.serialNumber}
                </Typography>
              )}
              {equipment.engine.modelNumber && (
                <Typography>
                  <strong>Engine Model Number:</strong>{" "}
                  {equipment.engine.modelNumber}
                </Typography>
              )}
            </Box>
          )}
      </Paper>

      {/* Service History Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Service History
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setServiceFormOpen(true)}
          >
            Add Service Record
          </Button>
        </Stack>

        {serviceRecords.length > 0 ? (
          serviceRecords.map((record, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(record.date).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Service:</strong> {record.serviceType}
              </Typography>
              {record.notes && (
                <Typography>
                  <strong>Notes:</strong> {record.notes}
                </Typography>
              )}
              {index !== serviceRecords.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))
        ) : (
          <Typography>No service records found.</Typography>
        )}
      </Paper>

      {/* Parts Installed Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Parts Installed
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPartsFormOpen(true)}
          >
            Add Part Record
          </Button>
        </Stack>

        {partRecords.length > 0 ? (
          partRecords.map((record, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography>
                <strong>Date Installed:</strong>{" "}
                {new Date(record.dateInstalled).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Part:</strong> {record.partName}
              </Typography>
              {record.notes && (
                <Typography>
                  <strong>Notes:</strong> {record.notes}
                </Typography>
              )}
              {record.cost !== undefined && (
                <Typography>
                  <strong>Cost:</strong> ${record.cost.toFixed(2)}
                </Typography>
              )}
              {index !== partRecords.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))
        ) : (
          <Typography>No parts installed yet.</Typography>
        )}
      </Paper>

      {/* Modals */}
      <EquipmentEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        equipment={equipment}
        onSaved={() => {
          setEditOpen(false);
          setLoading(true);
          fetchEquipment();
        }}
      />

      <ServiceRecordForm
        open={serviceFormOpen}
        onClose={() => setServiceFormOpen(false)}
        equipmentId={equipment.id!}
        onSaved={() => {
          setServiceFormOpen(false);
          fetchServiceHistory();
        }}
      />

      <PartsRecordForm
        open={partsFormOpen}
        onClose={() => setPartsFormOpen(false)}
        equipmentId={equipment.id!}
        onSaved={() => {
          setPartsFormOpen(false);
          fetchPartsHistory();
        }}
      />
    </Box>
  );
};

export default EquipmentDetails;
