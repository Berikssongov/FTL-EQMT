// src/components/Keys/AssignedKeysTable.tsx
import React, { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

interface Row {
  id: string;
  keyName: string;
  person: string;
  quantity: number;
}

const AssignedKeysTable: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "keys"));
      const result: Row[] = [];

      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.isRestricted && Array.isArray(data.holders)) {
          data.holders
            .filter((h: any) => h.type === "person")
            .forEach((h: any) => {
              result.push({
                id: `${docSnap.id}-${h.name}`,
                keyName: data.keyName,
                person: h.name,
                quantity: h.quantity,
              });
            });
        } else if (data.isRestricted && data.currentHolder?.type === "person") {
          result.push({
            id: docSnap.id,
            keyName: data.keyName,
            person: data.currentHolder.name,
            quantity: 1,
          });
        }
      });

      setRows(result);
    };

    fetchData();
  }, []);

  const columns: GridColDef[] = [
    { field: "keyName", headerName: "Key", flex: 1 },
    { field: "person", headerName: "Person", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        🔑 Currently Assigned Keys
      </Typography>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25]} />
      </div>
    </Paper>
  );
};

export default AssignedKeysTable;
