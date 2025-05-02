import React from "react";
import { Container, Typography } from "@mui/material";
import AssignedKeysUploader from "./AssignedKeysUploader";
import LockboxKeysUploader from "./LockboxKeysUploader";
import KeyLogUploader from "./KeyLogUploader";

const KeyImportPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        🔑 Key Data Import
      </Typography>
      <Typography variant="body1" gutterBottom>
        Use the tools below to upload CSV files containing current key assignments, lockbox keys, and historical logs.
      </Typography>

      <AssignedKeysUploader />
      <LockboxKeysUploader />
      <KeyLogUploader />
    </Container>
  );
};

export default KeyImportPage;
