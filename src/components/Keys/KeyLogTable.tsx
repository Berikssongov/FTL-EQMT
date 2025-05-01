// src/components/Keys/KeyLogTable.tsx

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const mockLogData = [
  {
    date: "2024-04-01",
    key: "B4",
    action: "Signed Out",
    person: "Alice",
    location: "Maintenance Box",
  },
  {
    date: "2024-04-03",
    key: "B4",
    action: "Signed In",
    person: "Alice",
    location: "Visitor Centre Box",
  },
];

const KeyLogTable: React.FC = () => {
  return (
    <Paper sx={{ mt: 4 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Key History Log
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockLogData.map((entry, idx) => (
            <TableRow key={idx}>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.key}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.person}</TableCell>
              <TableCell>{entry.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default KeyLogTable;
