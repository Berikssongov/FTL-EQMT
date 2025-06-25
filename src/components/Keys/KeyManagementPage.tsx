import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Divider,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase";
import KeyFormPanel from "./KeyFormPanel";
import KeySearchPanel from "./KeySearchPanel";
import KeyLogTable from "./KeyLogTable";
import AddKeyPanel from "./AddKeyPanel";

import { useRole } from "../../contexts/RoleContext";
import { useAuth } from "../../contexts/AuthContext";

interface KeyLogEntry {
  id: string;
  keyName: string;
  action: string;
  person: string;
  lockbox: string;
  date: string;
  submittedBy: string;
}

const KeyManagementPage: React.FC = () => {
  const { role, superAdmin, loading } = useRole();
  const [logs, setLogs] = useState<KeyLogEntry[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      const ref = collection(db, "keyLogs");
      const snapshot = await getDocs(query(ref, orderBy("timestamp", "desc")));

      const formatted = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          keyName: data.keyName,
          action: data.action === "Signing Out" ? "Signed Out" : "Signed In",
          person: data.person,
          lockbox: data.lockbox,
          date: new Date(data.timestamp).toLocaleString(),
          submittedBy: data.submittedBy || user?.displayName || "Unknown",
        };
      });

      setLogs(formatted);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Key Management
      </Typography>

      {/* 🔑 Only managers, admins, and superAdmins can sign in/out keys */}
      {(role === "manager" || role === "admin") && <KeyFormPanel />}

      {/* 🔐 Only superAdmins can add keys */}
      {superAdmin && <AddKeyPanel />}

      <Divider sx={{ my: 4 }} />

      {/* 🔎 Everyone including guests can search and view logs */}
      <KeySearchPanel />
      <KeyLogTable rows={logs.slice(0, 5)} />

      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 5 }}>
        Full Key History
      </Typography>
      <KeyLogTable rows={logs} />
    </Container>
  );
};

export default KeyManagementPage;
