/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider,
  Container,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { getServiceRecordById } from "../services/serviceRecordsService";
import { ServiceRecord } from "../types";
import EditServiceModal from "./EditServiceModal";
import { useRole } from "../contexts/RoleContext";

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useRole(); // ✅ NEW
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getServiceRecordById(id).then((data) => {
        setService(data);
        setLoading(false);
      });
    }
  }, [id]);

  const reload = async () => {
    if (id) {
      const data = await getServiceRecordById(id);
      setService(data);
    }
  };

  const canEdit = role === "admin"

  if (loading) return <CircularProgress />;
  if (!service) return <Typography>Service record not found.</Typography>;

  return (
    <Container maxWidth="md">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={600}>
            Service Details
          </Typography>
          {canEdit && (
            <IconButton onClick={() => setEditOpen(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Typography><strong>Summary:</strong> {service.summary}</Typography>
        <Typography><strong>Date:</strong> {new Date(service.date).toLocaleDateString()}</Typography>

        {service.vendorName && (
          <Typography><strong>Vendor:</strong> {service.vendorName}</Typography>
        )}
        {service.vendorContact && (
          <Typography><strong>Contact:</strong> {service.vendorContact}</Typography>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight={600}>Line Items</Typography>
        {service.items?.map((item, index) => (
          <Box key={index} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>{item.description}</Typography>
            <Typography>${item.cost.toFixed(2)}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography fontWeight={600}>
          Total Cost: ${service.totalCost?.toFixed(2) || "0.00"}
        </Typography>
      </Paper>

      {canEdit && editOpen && service && (
        <EditServiceModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          service={service}
          onSaved={reload}
        />
      )}
    </Container>
  );
};

export default ServiceDetail;
