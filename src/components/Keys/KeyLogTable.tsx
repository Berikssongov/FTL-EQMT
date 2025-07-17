/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";

export interface KeyLogEntry {
  id: string;
  date: string;
  action: string;
  keyName: string;
  person: string;
  lockbox: string;
  submittedBy: string; // NEW: Added Submitted By field
}

interface Props {
  rows: KeyLogEntry[];
}

const columns: GridColDef[] = [
  { field: "date", headerName: "Date", flex: 1 },
  { field: "action", headerName: "Action", flex: 1 },
  { field: "keyName", headerName: "Key", flex: 1 },
  { field: "person", headerName: "Person", flex: 1 },
  { field: "lockbox", headerName: "Location", flex: 1 },
  { field: "submittedBy", headerName: "Submitted By", flex: 1 }, // NEW: Column for Submitted By
];

const KeyLogTable: React.FC<Props> = ({ rows }) => (
  <Paper sx={{ p: 2, mt: 4 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      📘 Recent Key Activity
    </Typography>
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  </Paper>
);

export default KeyLogTable;
