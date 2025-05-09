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
import { getPartRecordById } from "../services/partsRecordsService";
import { PartRecord } from "../types";
import EditPartModal from "./EditPartModal";
import { useRole } from "../contexts/RoleContext";

const PartDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useRole(); // ✅ NEW
  const [part, setPart] = useState<PartRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getPartRecordById(id).then((record) => {
        setPart(record);
        setLoading(false);
      });
    }
  }, [id]);

  const reload = async () => {
    if (id) {
      const record = await getPartRecordById(id);
      setPart(record);
    }
  };

  const canEdit = role === "admin"

  if (loading) return <CircularProgress />;
  if (!part) return <Typography>Part record not found.</Typography>;

  return (
    <Container maxWidth="md">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={600}>
            Part Details
          </Typography>
          {canEdit && (
            <IconButton onClick={() => setEditOpen(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Typography><strong>Name:</strong> {part.partName}</Typography>
        <Typography><strong>Part #:</strong> {part.partNumber}</Typography>
        <Typography><strong>Vendor:</strong> {part.vendor}</Typography>
        {part.vendorName && (
          <Typography><strong>Vendor Name:</strong> {part.vendorName}</Typography>
        )}
        {part.vendorContact && (
          <Typography><strong>Contact:</strong> {part.vendorContact}</Typography>
        )}
        <Typography>
          <strong>Date Installed:</strong>{" "}
          {part.dateInstalled ? new Date(part.dateInstalled).toLocaleDateString() : "N/A"}
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Typography fontWeight={600}>
          Price: ${part.price?.toFixed(2) || "0.00"}
        </Typography>
      </Paper>

      {canEdit && editOpen && part && (
        <EditPartModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          part={part}
          onSaved={reload}
        />
      )}
    </Container>
  );
};

export default PartDetail;
