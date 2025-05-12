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
import { useRole } from "../../contexts/RoleContext"; // ✅ NEW
import { useAuth } from "../../contexts/AuthContext";

interface KeyLogEntry {
  id: string;
  keyName: string;
  action: string;
  person: string;
  lockbox: string;
  date: string;
  submittedBy: string; // Add this field to match the KeyLogTable type
}

const KeyManagementPage: React.FC = () => {
  const { role } = useRole(); // ✅ NEW
  const [logs, setLogs] = useState<KeyLogEntry[]>([]);
  const { user } = useAuth(); // Updated to match the context


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
          submittedBy: data.submittedBy || user?.displayName || "Unknown", // Use the logged-in user's name
        };
      });
    
      setLogs(formatted);
    };
    

    fetchLogs();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Key Management
      </Typography>

      {(role === "manager" || role === "admin") && <KeyFormPanel />} {/* ✅ Restrict form access */}

      <Divider sx={{ my: 4 }} />
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
