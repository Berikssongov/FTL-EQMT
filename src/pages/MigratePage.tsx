// src/pages/MigratePage.tsx
import React, { useState } from "react";
import { Container, Button, Typography, Alert } from "@mui/material";
import { migrateKeyData } from "../scripts/migrateKeyData";

const MigratePage: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");

  const handleMigrate = async () => {
    try {
      setStatus("running");
      await migrateKeyData();
      setStatus("done");
    } catch (e) {
      console.error("❌ Migration error:", e);
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        🔧 Migrate Key Data
      </Typography>
      <Typography variant="body1" gutterBottom>
        This moves your current keys into the new structure. Run this ONCE.
      </Typography>
      <Button variant="contained" onClick={handleMigrate} disabled={status === "running"}>
        Run Migration
      </Button>

      {status === "done" && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Migration complete!
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error" sx={{ mt: 3 }}>
          ❌ Migration failed. Check the console.
        </Alert>
      )}
    </Container>
  );
};

export default MigratePage;
