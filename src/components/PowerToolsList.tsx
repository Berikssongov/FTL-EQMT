// src/components/PowerToolsList.tsx
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
} from "@mui/material";
import { fetchPowerTools } from "../services/powerToolsService";
import { PowerTool } from "../types";
import AddPowerToolModal from "./AddPowerToolModal"; // ✅ Import the modal

const PowerToolsList: React.FC = () => {
  const [tools, setTools] = useState<PowerTool[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    loadPowerTools();
  }, []);

  const loadPowerTools = async () => {
    try {
      const data = await fetchPowerTools();
      setTools(data);
    } catch (error) {
      console.error("Error fetching power tools:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Power Tools Inventory
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setAddModalOpen(true)}
      >
        Add Power Tool
      </Button>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Condition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{tool.serialNumber}</TableCell>
                  <TableCell>{tool.condition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Power Tool Modal */}
      <AddPowerToolModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={loadPowerTools}
      />
    </Box>
  );
};

export default PowerToolsList;
