import React from "react";
import { Button, Typography } from "@mui/material";
import Papa from "papaparse";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";

const LockboxKeysUploader: React.FC = () => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const lockboxKeysCollection = collection(db, "lockboxKeys");

          let importedCount = 0;

          for (const row of results.data as any[]) {
            const keyName = row.keyName?.trim();
            const lockboxLocation = row.lockboxLocation?.trim();

            if (!keyName || !lockboxLocation) {
              console.warn("Skipped invalid row:", row);
              continue;
            }

            const docData = {
              keyName,
              lockboxLocation,
            };

            console.log("Importing row:", docData);
            await addDoc(lockboxKeysCollection, docData);
            importedCount++;
          }

          alert(`Imported ${importedCount} lockbox keys successfully.`);
        } catch (error) {
          console.error("Error importing lockbox keys:", error);
          alert("Error importing lockbox keys.");
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
      <Typography variant="h6" gutterBottom>Import Lockbox Keys</Typography>
      <Button variant="contained" component="label">
        Upload Lockbox Keys CSV
        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </Button>
    </>
  );
};

export default LockboxKeysUploader;
