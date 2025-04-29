import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { fetchPowerTools } from "../services/powerToolsService";
import { PowerTool } from "../types";
import EditPowerToolModal from "./EditPowerToolModal";
import AddPowerToolModal from "./AddPowerToolModal";

const PowerToolsList: React.FC = () => {
  const [tools, setTools] = useState<PowerTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<PowerTool | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    const data = await fetchPowerTools();
    setTools(data);
    setLoading(false);
  };

  const handleEdit = (tool: PowerTool) => {
    setSelectedTool(tool);
    setEditOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Power Tools Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Tool
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tool</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Serial #</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{tool.serialNumber || "—"}</TableCell>
                  <TableCell>{tool.condition}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(tool)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {selectedTool && (
        <EditPowerToolModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedTool(null);
          }}
          tool={selectedTool}
          onSaved={loadTools}
        />
      )}

      <AddPowerToolModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={loadTools}
      />
    </Box>
  );
};

export default PowerToolsList;
