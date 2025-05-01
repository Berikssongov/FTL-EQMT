// src/components/Keys/KeyManagementPage.tsx

import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import KeyFormPanel from "./KeyFormPanel";
import KeySearchPanel from "./KeySearchPanel";
import KeyLogTable from "./KeyLogTable";
import KeyHistoryTable from "./KeyHistoryTable";

const KeyManagementPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Key Management
      </Typography>

      {/* 📋 Key Sign-In/Out Form */}
      <KeyFormPanel />

      <Divider sx={{ my: 4 }} />

      {/* 🔍 Search Section */}
      <KeySearchPanel />

      {/* 🧾 Logs and Activity */}
      <KeyHistoryTable />
      <KeyLogTable />
    </Container>
  );
};

export default KeyManagementPage;
