// src/components/Keys/LockboxKeysTable.tsx
import React, { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

interface Row {
  id: string;
  keyName: string;
  location: string;
  quantity: number;
}

const LockboxKeysTable: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "keys"));
      const result: Row[] = [];

      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.isRestricted && Array.isArray(data.holders)) {
          data.holders
            .filter((h: any) => h.type === "lockbox")
            .forEach((h: any) => {
              result.push({
                id: `${docSnap.id}-${h.name}`,
                keyName: data.keyName,
                location: h.name,
                quantity: h.quantity,
              });
            });
        } else if (data.isRestricted && data.currentHolder?.type === "lockbox") {
          result.push({
            id: docSnap.id,
            keyName: data.keyName,
            location: data.currentHolder.name,
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
    { field: "location", headerName: "Location", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        🧰 Keys in Lockboxes
      </Typography>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25]} />
      </div>
    </Paper>
  );
};

export default LockboxKeysTable;
