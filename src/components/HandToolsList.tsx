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

import { fetchHandTools } from "../services/handToolsService";
import { HandTool } from "../types";
import EditHandToolModal from "./EditHandToolsModal";
import AddHandToolModal from "./AddHandToolModal";

const HandToolsList: React.FC = () => {
  const [tools, setTools] = useState<HandTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<HandTool | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    const data = await fetchHandTools();
    setTools(data);
    setLoading(false);
  };

  const handleEdit = (tool: HandTool) => {
    setSelectedTool(tool);
    setEditOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Hand Tools Inventory</Typography>
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
                <TableCell>Condition</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{tool.condition}</TableCell>
                  <TableCell>{tool.quantity}</TableCell>
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
        <EditHandToolModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedTool(null);
          }}
          tool={selectedTool}
          onSaved={loadTools}
        />
      )}

      <AddHandToolModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={loadTools}
      />
    </Box>
  );
};

export default HandToolsList;
