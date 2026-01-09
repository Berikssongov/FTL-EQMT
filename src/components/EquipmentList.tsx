/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";

import { fetchEquipment } from "../services/equipmentServices";
import { Equipment } from "../types";
import AddEquipmentModal from "./AddEquipmentModal";
import { useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import BuildIcon from "@mui/icons-material/Build";

import { getAllUsers } from "../services/userService";
import { User } from "../types";

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


const EquipmentList: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { role } = useRole();
  const isAdmin = role === "admin"; // ✅ NEW

  const [users, setUsers] = useState<User[]>([]);

const loadUsers = async () => {
  const data = await getAllUsers();
  setUsers(data || []);
};

useEffect(() => {
  loadEquipment();
  loadUsers(); // 👈 add this
}, []);


  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await fetchEquipment();
      setEquipmentList(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  // Widget logic
  const inUseCount = equipmentList.filter((e) => e.status?.toLowerCase() === "in use").length;
  const needsInspectionCount = equipmentList.filter(
    (e) => e.inspection?.status?.toLowerCase() !== "pass"
  ).length;
  const brokenEquipment = equipmentList.filter((e) =>
    ["broken", "out of service"].some((t) =>
      e.condition?.toLowerCase().includes(t)
    )
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600} sx={{ mb: 2 }}>
        Equipment List
      </Typography>

      {/* Widgets */}
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
        <Card sx={{ minWidth: 200, flex: "1 1 30%" }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentTurnedInIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">In Use</Typography>
                <Typography variant="h6">{inUseCount}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: "1 1 30%" }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <ReportProblemIcon color="warning" />
              <Box>
                <Typography variant="body2" color="text.secondary">Needs Inspection</Typography>
                <Typography variant="h6">{needsInspectionCount}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: "1 1 30%" }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <BuildIcon color="error" />
              <Box>
                <Typography variant="body2" color="text.secondary">Broken</Typography>
                <Typography variant="h6">{brokenEquipment.length}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Add Button */}
      {role === "admin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Add Equipment
          </Button>
        </Box>
      )}

      {/* Equipment Table */}
      {loading ? (
        <CircularProgress />
      ) : equipmentList.length === 0 ? (
        <Typography>No equipment found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table aria-label="equipment table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Inspection</TableCell>
                <TableCell>Assigned To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentList.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/equipment/${item.id}`)}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      item.location
                    ) : (
                      <Box sx={redactedStyle} />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.lastInspection
                      ? new Date(item.lastInspection).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
  {
    users.find((u) => u.id === item.assignedTo)
      ? `${users.find((u) => u.id === item.assignedTo)?.firstName} ${users.find((u) => u.id === item.assignedTo)?.lastName}`
      : "—"
  }
</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      {role === "admin" && (
        <AddEquipmentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSaved={() => {
            loadEquipment();
            setOpenModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default EquipmentList;
