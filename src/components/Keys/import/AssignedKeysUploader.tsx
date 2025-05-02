import React from "react";
import { Button, Typography } from "@mui/material";
import Papa from "papaparse";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";

const AssignedKeysUploader: React.FC = () => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const assignedKeysCollection = collection(db, "assignedKeys");

          for (const row of results.data as any[]) {
            const keyName = row.keyName?.trim();
            const person = row.person?.trim();

            if (keyName && person) {
              await addDoc(assignedKeysCollection, { keyName, person });
            }
          }

          alert("Assigned keys imported successfully!");
        } catch (error) {
          console.error("Error importing assigned keys:", error);
          alert("Error importing assigned keys.");
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
      <Typography variant="h6" gutterBottom>Import Assigned Keys</Typography>
      <Button variant="contained" component="label">
        Upload Assigned Keys CSV
        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </Button>
    </>
  );
};

export default AssignedKeysUploader;
