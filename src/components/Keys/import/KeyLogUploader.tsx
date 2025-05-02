// src/components/keys/import/KeyLogUploader.tsx
import React from "react";
import { Button, Typography } from "@mui/material";
import Papa from "papaparse";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";

const KeyLogUploader: React.FC = () => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const keyLogCollection = collection(db, "keyLogs");
          let count = 0;

          for (const row of results.data as any[]) {
            const rawTimestamp = row.timestamp?.trim();
            const keyName = row.keyName?.trim();
            const action = row.action?.trim();
            const person = row.person?.trim();
            const lockbox = row.lockbox?.trim();

            if (
              !rawTimestamp ||
              !keyName ||
              !action ||
              !person ||
              !lockbox ||
              !["Signing In", "Signing Out"].includes(action)
            ) {
              console.warn("Skipped invalid row:", row);
              continue;
            }

            // Convert timestamp to ISO format
            const isoTimestamp = new Date(rawTimestamp).toISOString();

            const logEntry = {
              keyName,
              action,
              person,
              lockbox,
              timestamp: isoTimestamp,
            };

            console.log("Importing log entry:", logEntry);
            await addDoc(keyLogCollection, logEntry);
            count++;
          }

          alert(`Imported ${count} key log entries successfully.`);
        } catch (error) {
          console.error("Error importing key logs:", error);
          alert("Error importing key logs.");
        }
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        alert("Failed to parse CSV.");
      },
    });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>Import Key Logs</Typography>
      <Button variant="contained" component="label">
        Upload Key Log CSV
        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </Button>
    </>
  );
};

export default KeyLogUploader;
