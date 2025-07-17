/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { fetchPowerTools } from "../services/powerToolsService";
import { PowerTool } from "../types";
import EditPowerToolModal from "./EditPowerToolModal";
import AddPowerToolModal from "./AddPowerToolModal";
import { useRole } from "../contexts/RoleContext"; // ✅ NEW

const PowerToolsList: React.FC = () => {
  const [tools, setTools] = useState<PowerTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PowerTool | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { role } = useRole(); // ✅ NEW
  const isAdmin = role === "admin"; // ✅ NEW

  const loadTools = async () => {
    setLoading(true);
    const data = await fetchPowerTools();
    setTools(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTools();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600} sx={{ mb: 2 }}>
        Power Tools
      </Typography>

      {isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            Add Power Tool
          </Button>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Serial Number</TableCell>
                {isAdmin && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{tool.condition}</TableCell>
                  <TableCell>{tool.serialNumber}</TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton onClick={() => setEditing(tool)} size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editing && isAdmin && (
        <EditPowerToolModal
          open={!!editing}
          onClose={() => setEditing(null)}
          tool={editing}
          onSaved={() => {
            loadTools();
            setEditing(null);
          }}
        />
      )}

      {isAdmin && (
        <AddPowerToolModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSaved={() => {
            loadTools();
            setOpenAdd(false);
          }}
        />
      )}
    </Box>
  );
};

export default PowerToolsList;
