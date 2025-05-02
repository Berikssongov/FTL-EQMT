import React, { useState } from "react";
import { Button, Container, Typography, Alert } from "@mui/material";
import { migrateNonRestrictedKeys } from "../scripts/migrateNonRestrictedHolders";

const MigrateHoldersPage: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");

  const runMigration = async () => {
    setStatus("running");
    try {
      await migrateNonRestrictedKeys();
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        🔁 Migrate Non-Restricted Keys to holders[]
      </Typography>
      <Typography variant="body2" gutterBottom>
        Run this ONCE to convert existing non-restricted key data.
      </Typography>

      <Button variant="contained" onClick={runMigration} disabled={status === "running"}>
        Run Migration
      </Button>

      {status === "done" && <Alert severity="success" sx={{ mt: 2 }}>Migration complete ✅</Alert>}
      {status === "error" && <Alert severity="error" sx={{ mt: 2 }}>Migration failed ❌</Alert>}
    </Container>
  );
};

export default MigrateHoldersPage;
