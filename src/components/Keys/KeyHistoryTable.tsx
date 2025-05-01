// src/components/Keys/KeyHistoryTable.tsx

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

const KeyHistoryTable: React.FC = () => {
  const mockHistory = [
    {
      date: "2024-04-01",
      action: "Signed Out",
      key: "C5",
      person: "Bob",
      location: "Maintenance Box",
    },
    {
      date: "2024-04-02",
      action: "Signed In",
      key: "C5",
      person: "Bob",
      location: "Artifacts Box",
    },
  ];

  return (
    <Paper sx={{ mt: 4 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Recent Activity
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockHistory.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.key}</TableCell>
              <TableCell>{entry.person}</TableCell>
              <TableCell>{entry.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default KeyHistoryTable;
