// src/components/PartDetail.tsx
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
import { getPartRecordById } from "../services/partsRecordsService";
import { PartRecord } from "../types";

const PartDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState<PartRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPartRecordById(id).then((record) => {
        setPart(record as PartRecord);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!part) return <Typography>Part record not found.</Typography>;

  return (
    <Container maxWidth="md">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Part Details
        </Typography>
        <Typography><strong>Name:</strong> {part.partName}</Typography>
        <Typography><strong>Part #:</strong> {part.partNumber}</Typography>
        <Typography><strong>Vendor:</strong> {part.vendor}</Typography>
        <Typography>
  <strong>Date Installed:</strong>{" "}
  {part.dateInstalled ? new Date(part.dateInstalled).toLocaleDateString() : "N/A"}
</Typography>



        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" fontWeight={600}>
          Cost: ${part.price?.toFixed(2)}
        </Typography>
      </Paper>
    </Container>
  );
};

export default PartDetail;
