// src/components/ServiceDetail.tsx
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
} from "@mui/material";
import { getServiceRecordById } from "../services/serviceRecordsService";
import { ServiceRecord } from "../types";

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getServiceRecordById(id).then((record) => {
        setService(record);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!service) return <Typography>Service record not found.</Typography>;

  return (
    <Container maxWidth="md">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Service Details
        </Typography>
        <Typography><strong>Summary:</strong> {service.summary}</Typography>
        <Typography><strong>Date:</strong> {new Date(service.date).toLocaleDateString()}</Typography>

        {service.vendorName && (
          <Typography><strong>Vendor:</strong> {service.vendorName}</Typography>
        )}
        {service.vendorContact && (
          <Typography><strong>Contact:</strong> {service.vendorContact}</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={600}>Line Items</Typography>
        {service.items && service.items.length > 0 ? (
          <Box sx={{ mt: 1 }}>
            {service.items.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>{item.description}</Typography>
                <Typography>${item.cost.toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={600}>
              Total: ${service.totalCost?.toFixed(2)}
            </Typography>
          </Box>
        ) : (
          <Typography>No items listed.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ServiceDetail;
