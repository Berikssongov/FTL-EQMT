/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Keys/KeyManagementPage.tsx
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
  Timestamp,
} from "firebase/firestore";

import { db } from "../../firebase";
import KeyFormPanel from "./KeyFormPanel";
import KeySearchPanel from "./KeySearchPanel";
import KeyLogTable from "./KeyLogTable";
import AddKeyPanel from "./AddKeyPanel";

import { useRole } from "../../contexts/RoleContext";
import { useAuth } from "../../contexts/AuthContext";
import { KeyData } from "../../types";

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
  const { user } = useAuth();

  const [logs, setLogs] = useState<KeyLogEntry[]>([]);
  const [allKeys, setAllKeys] = useState<KeyData[]>([]);

  // Fetch key logs
  const fetchLogs = async () => {
    try {
      const ref = collection(db, "keyLogs");
      const snapshot = await getDocs(query(ref, orderBy("timestamp", "desc")));

      const formatted = snapshot.docs.map((doc) => {
        const data = doc.data();

        let dateString = "";
        if (data.timestamp instanceof Timestamp) {
          const date = data.timestamp.toDate();
          dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (typeof data.timestamp === "string") {
          const date = new Date(data.timestamp);
          dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          dateString = "Unknown Date";
        }

        return {
          id: doc.id,
          keyName: data.keyName,
          action: data.action === "Signing Out" ? "Signed Out" : "Signed In",
          person: data.person,
          lockbox: data.lockbox,
          date: dateString,
          submittedBy: data.submittedBy || user?.displayName || "Unknown",
        };
      });

      setLogs(formatted);
    } catch (error) {
      console.error("Error fetching key logs:", error);
    }
  };

  // Fetch keys
  const fetchKeys = async () => {
    try {
      const snapshot = await getDocs(collection(db, "keys"));
      const keys = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<KeyData, "id">),
      }));
      setAllKeys(keys);
    } catch (error) {
      console.error("Error fetching keys:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchKeys();
  }, []);

  const refreshAll = async () => {
    await fetchLogs();
    await fetchKeys();
  };
  

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

      {/* 🔑 Only managers and admins can sign keys in/out */}
      {(role === "manager" || role === "admin") && (
        <KeyFormPanel keys={allKeys} refreshKeys={refreshAll} />
      )}

      {/* 🔐 Only superAdmins can add keys */}
      {superAdmin && <AddKeyPanel refreshKeys={refreshAll} />}

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
