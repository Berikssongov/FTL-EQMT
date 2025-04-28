// src/components/HandToolsList.tsx
import React, { useState, useEffect } from "react";
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
  Button,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { fetchHandTools } from "../services/handToolsService";
import { HandTool } from "../types";
import AddHandToolModal from "./AddHandToolModal";
import EditHandToolQuantityModal from "./EditHandToolQuantityModal"; // ✅ Import

const HandToolsList: React.FC = () => {
  const [tools, setTools] = useState<HandTool[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedToolQuantity, setSelectedToolQuantity] = useState<number>(0);

  useEffect(() => {
    loadHandTools();
  }, []);

  const loadHandTools = async () => {
    try {
      const data = await fetchHandTools();
      setTools(data);
    } catch (error) {
      console.error("Error fetching hand tools:", error);
    }
  };

  const handleEditClick = (toolId: string, quantity: number) => {
    setSelectedToolId(toolId);
    setSelectedToolQuantity(quantity);
    setEditModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Hand Tools Inventory
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setAddModalOpen(true)}
      >
        Add Hand Tool
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="center">Edit</TableCell>{" "}
                {/* ✅ New Edit column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{tool.condition}</TableCell>
                  <TableCell>{tool.quantity}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditClick(tool.id!, tool.quantity)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Hand Tool Modal */}
      <AddHandToolModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={loadHandTools}
      />

      {/* Edit Hand Tool Quantity Modal */}
      {selectedToolId && (
        <EditHandToolQuantityModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          toolId={selectedToolId}
          currentQuantity={selectedToolQuantity}
          onSaved={loadHandTools}
        />
      )}
    </Box>
  );
};

export default HandToolsList;
