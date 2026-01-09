/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  IconButton,
  CircularProgress,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useParams, useNavigate } from "react-router-dom";
import {
  Equipment,
  EquipmentServiceRecord,
  EquipmentPart,
  EquipmentInspection,
  User,
} from "../types";

import { getEquipmentById, updateEquipment } from "../services/equipmentServices";
import { fetchServiceRecordsByEquipmentId } from "../services/serviceRecordsService";
import { fetchPartRecordsByEquipmentId } from "../services/partsRecordsService";
import { getAllUsers } from "../services/userService";

import EquipmentEditModal from "./EquipmentEditModal";
import AddServiceModal from "./AddServiceModal";
import AddPartModal from "./AddPartModal";
import { useRole } from "../contexts/RoleContext";

const redactedStyle = {
  height: 18,
  width: "100%",
  maxWidth: 140,
  backgroundColor: "#000",
  borderRadius: 4,
  position: "relative",
  overflow: "hidden",
  cursor: "not-allowed",

  "&::after": {
    content: '"Secrets 🤫"',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 600,
    opacity: 0,
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },

  "&:hover::after": {
    opacity: 1,
  },
};


const EquipmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [partOpen, setPartOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<EquipmentServiceRecord[]>([]);
  const [parts, setParts] = useState<EquipmentPart[]>([]);
  const { role, loading: roleLoading } = useRole();
  const isAdmin = role === "admin"; // ✅ NEW

  const canEdit = role === "admin";
  const canAddServiceOrParts = role === "admin" || role === "manager";

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

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data || []);
  };

  const reloadAll = () => {
    if (id) {
      loadEquipment(id);
      loadServices(id);
      loadParts(id);
      loadUsers();
    }
  };

  useEffect(() => {
    if (id && !roleLoading) {
      reloadAll();
    }
  }, [id, roleLoading]);

  if (loading || roleLoading) return <CircularProgress />;
  if (!equipment) return <Typography>Equipment not found.</Typography>;

  const assignedUser = users.find((u) => u.id === equipment.assignedTo);
  const inspection = equipment.inspection;

  const inspectionStatus = inspection?.status?.toLowerCase() ?? "unknown";
const hasFindings = !!(
  inspection &&
  Array.isArray(inspection.findings) &&
  inspection.findings.length > 0
);


  let inspectionLabel = "Not Inspected";
  let inspectionColor:
    | "success"
    | "warning"
    | "error"
    | "disabled"
    | "action"
    | "inherit"
    | "primary"
    | "secondary"
    | "info"
    | undefined = "disabled";

  if (inspectionStatus === "pass") {
    inspectionLabel = "Passed Inspection";
    inspectionColor = "success";
  } else if (inspectionStatus === "fail") {
    inspectionLabel = "Needs Attention";
    inspectionColor = "error";
  } else if (inspectionStatus === "no" || hasFindings) {
    inspectionLabel = "Findings Reported";
    inspectionColor = "warning";
  }

  const handleAssignChange = async (value: string) => {
    if (!canEdit || !equipment?.id) return;
    await updateEquipment(equipment.id, { ...equipment, assignedTo: value });
    reloadAll();
  };

  const handleInspectionChange = async (
    field: "status" | "findings",
    value: string
  ) => {
    if (!canEdit || !equipment?.id) return;

    const updatedInspection: EquipmentInspection = {
      status: field === "status" ? value : inspection?.status || "",
      findings:
        field === "findings"
          ? value.split(",").map((f) => f.trim()).filter(Boolean)
          : inspection?.findings || [],
    };

    await updateEquipment(equipment.id, {
      ...equipment,
      inspection: updatedInspection,
      lastInspection: new Date().toISOString(),
    });

    reloadAll();
  };

  return (
    <Box>
      <Button onClick={() => navigate("/equipment")} sx={{ mb: 2 }}>
        ← Back to Equipment List
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={600}>
            {equipment.name}
          </Typography>
          {canEdit && (
            <IconButton onClick={() => setEditOpen(true)} color="primary">
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          {/* Assigned To */}
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentIndIcon color="info" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Assigned To
                  </Typography>
                  {canEdit ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={equipment.assignedTo || ""}
                        onChange={(e) => handleAssignChange(e.target.value)}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="h6">
                      {assignedUser
                        ? `${assignedUser.firstName} ${assignedUser.lastName}`
                        : "Unassigned"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Inspection */}
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <FactCheckIcon color={inspectionColor} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Inspection
                  </Typography>
                  {canEdit ? (
                    <>
                      <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={inspection?.status || ""}
                          onChange={(e) =>
                            handleInspectionChange("status", e.target.value)
                          }
                          label="Status"
                        >
                          <MenuItem value="pass">Pass</MenuItem>
                          <MenuItem value="fail">Fail</MenuItem>
                          <MenuItem value="no">Not Inspected</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Findings"
                        placeholder="comma-separated"
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={inspection?.findings?.join(", ") || ""}
                        onChange={(e) =>
                          handleInspectionChange("findings", e.target.value)
                        }
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">{inspectionLabel}</Typography>
                      {hasFindings && (
                        <Typography variant="body2" color="text.secondary">
                          Findings: {inspection?.findings?.join(", ")}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* General Info */}
        <Typography><strong>Category:</strong> {equipment.category}</Typography>
        <Typography><strong>Make:</strong> {equipment.make}</Typography>
        <Typography><strong>Model #:</strong> {equipment.modelNumber}</Typography>
        <Typography><strong>Serial #:</strong> {equipment.serialNumber}</Typography>
        <Typography><strong>Status:</strong> {equipment.status}</Typography>
        <Typography><strong>Condition:</strong> {equipment.condition}</Typography>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <strong>Location:</strong>
            {isAdmin ? (
              <span>{equipment.location}</span>
            ) : (
              <Box sx={redactedStyle} />
            )}
          </Typography>
        {equipment.lastInspection && (
          <Typography>
            <strong>Last Inspected:</strong>{" "}
            {new Date(equipment.lastInspection).toLocaleString()}
          </Typography>
        )}
        {equipment.notes && (
          <Typography><strong>Notes:</strong> {equipment.notes}</Typography>
        )}
      </Paper>

      {/* Service + Parts */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
        <Box sx={{ flex: "1 1 48%", minWidth: "300px" }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>Service History</Typography>
              {canAddServiceOrParts && (
                <Button variant="outlined" size="small" onClick={() => setServiceOpen(true)}>
                  + Add
                </Button>
              )}
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
                  <Typography fontWeight={600}>{svc.summary || "Service Entry"}</Typography>
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

        <Box sx={{ flex: "1 1 48%", minWidth: "300px" }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>Parts</Typography>
              {canAddServiceOrParts && (
                <Button variant="outlined" size="small" onClick={() => setPartOpen(true)}>
                  + Add
                </Button>
              )}
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
      {canEdit && editOpen && equipment && (
        <EquipmentEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          equipment={equipment}
          onSaved={reloadAll}
        />
      )}
      {canAddServiceOrParts && serviceOpen && (
        <AddServiceModal
          open={serviceOpen}
          onClose={() => setServiceOpen(false)}
          equipmentId={id!}
          onSaved={reloadAll}
        />
      )}
      {canAddServiceOrParts && partOpen && (
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
