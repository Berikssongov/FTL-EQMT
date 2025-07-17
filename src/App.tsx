// src/App.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Container,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import AppHeader from "./components/Layout/AppHeader";
import Sidebar from "./components/Layout/Sidebar"

// imports remain unchanged
import EquipmentList from "./components/EquipmentList";
import EquipmentDetails from "./components/EquipmentDetails";
import DashboardHome from "./components/DashboardHome";
import HandToolsList from "./components/HandToolsList";
import PowerToolsList from "./components/PowerToolsList";
import ManageLocationsPage from "./components/ManageLocationsPage";
import ServiceDetail from "./components/ServiceDetail";
import PartDetail from "./components/PartDetail";
import BackupRestorePage from "./pages/BackupRestorePage";
import KeyManagementPage from "./components/Keys/KeyManagementPage";
import AssignedKeysTable from "./components/Keys/AssignedKeysTable";
import LockboxKeysTable from "./components/Keys/LockboxKeysTable";
import MMSOverview from "./components/MMS/MMSOverview";
import AssetList from "./components/MMS/Assets/AssetList";
import AssetDetail from "./components/MMS/Assets/AssetDetail";
import LoginPage from "./pages/LoginPage";
import ComponentDetail from "./components/MMS/Components/ComponentDetail";
import { RoleProvider } from "./contexts/RoleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const App: React.FC = () => {
  interface AssignedKey {
    id: string;
    keyName: string;
    person: string;
  }

  interface LockboxKey {
    id: string;
    keyName: string;
    lockboxLocation: string;
  }

  const [assignedKeys, setAssignedKeys] = useState<AssignedKey[]>([]);
  const [lockboxKeys, setLockboxKeys] = useState<LockboxKey[]>([]);

  useEffect(() => {
    const fetchKeys = async () => {
      const assignedSnap = await getDocs(collection(db, "assignedKeys"));
      const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));

      setAssignedKeys(
        assignedSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AssignedKey, "id">),
        }))
      );

      setLockboxKeys(
        lockboxSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LockboxKey, "id">),
        }))
      );
    };

    fetchKeys();
  }, []);

  return (
    <AuthProvider>
      <RoleProvider>
        <Router>
          <CssBaseline />

          {/* App layout wrapper */}
          <Box display="flex">
            <Sidebar /> {/* ✅ New Sidebar injected here */}

            <Box flexGrow={1}>
              <AppHeader /> {/* ✅ Top bar only */}
              <Box component="main" sx={{ p: 3, overflowY: "auto" }}>
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/equipment" element={<Container maxWidth="lg"><EquipmentList /></Container>} />
                  <Route path="/equipment/:id" element={<Container maxWidth="lg"><EquipmentDetails /></Container>} />
                  <Route path="/hand-tools" element={<Container maxWidth="lg"><HandToolsList /></Container>} />
                  <Route path="/power-tools" element={<Container maxWidth="lg"><PowerToolsList /></Container>} />
                  <Route path="/keys" element={<Container maxWidth="lg"><KeyManagementPage /></Container>} />
                  <Route path="/locations" element={<Container maxWidth="lg"><ManageLocationsPage /></Container>} />
                  <Route path="/keys-lockbox" element={<Container maxWidth="lg"><LockboxKeysTable /></Container>} />
                  <Route path="/keys-assigned" element={<Container maxWidth="lg"><AssignedKeysTable /></Container>} />
                  <Route path="/service/:id" element={<ServiceDetail />} />
                  <Route path="/parts/:id" element={<PartDetail />} />
                  <Route path="/mms" element={<MMSOverview />} />
                  <Route path="/mms/assets" element={<Container maxWidth="lg"><AssetList /></Container>} />
                  <Route path="/mms/assets/:id" element={<Container maxWidth="lg"><AssetDetail /></Container>} />
                  <Route path="/components/:id" element={<ComponentDetail />} />
                  <Route path="/settings/backup" element={<BackupRestorePage />} />
                  <Route path="/login" element={<LoginPage />} />
                </Routes>
              </Box>
            </Box>
          </Box>

          <Analytics />
          <SpeedInsights />
        </Router>
      </RoleProvider>
    </AuthProvider>
  );
};

export default App;
