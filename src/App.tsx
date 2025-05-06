// src/App.tsx
import { Analytics } from "@vercel/analytics/react";
import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Container,
  Typography,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import AppHeader from "./components/Layout/AppHeader";

import EquipmentList from "./components/EquipmentList";
import EquipmentDetails from "./components/EquipmentDetails";
import DashboardHome from "./components/DashboardHome";
import HandToolsList from "./components/HandToolsList";
import PowerToolsList from "./components/PowerToolsList";
import ManageLocationsPage from "./components/ManageLocationsPage";
import ServiceDetail from "./components/ServiceDetail";
import PartDetail from "./components/PartDetail";

import KeyManagementPage from "./components/Keys/KeyManagementPage";
import AssignedKeysTable from "./components/Keys/AssignedKeysTable";
import LockboxKeysTable from "./components/Keys/LockboxKeysTable";
import KeyImportPage from "./components/Keys/import/KeyImportPage";

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

import MigratePage from "./pages/MigratePage";
import MigrateHoldersPage from "./pages/MigrateHoldersPage";

import AssetList from "./components/MMS/Assets/AssetList";
import AssetDetail from "./components/MMS/Assets/AssetDetail";
import ComponentList from "./components/MMS/Components/ComponentList";
import MMSOverview from "./components/MMS/MMSOverview";


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
    <Router>
      <CssBaseline />
      <AppHeader />
      <Box component="main" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/equipment" element={
            <Container maxWidth="lg">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Equipment List
              </Typography>
              <EquipmentList />
            </Container>
          } />
          <Route path="/equipment/:id" element={
            <Container maxWidth="lg">
              <EquipmentDetails />
            </Container>
          } />
          <Route path="/hand-tools" element={
            <Container maxWidth="lg">
              <HandToolsList />
            </Container>
          } />
          <Route path="/power-tools" element={
            <Container maxWidth="lg">
              <PowerToolsList />
            </Container>
          } />
          <Route path="/keys" element={
            <Container maxWidth="lg">
              <KeyManagementPage />
            </Container>
          } />
          <Route path="/locations" element={
            <Container maxWidth="lg">
              <ManageLocationsPage />
            </Container>
          } />
          <Route path="/keys-lockbox" element={
            <Container maxWidth="lg">
              <LockboxKeysTable />
            </Container>
          } />
          <Route path="/import-keys" element={<KeyImportPage />} />
          <Route path="/keys-assigned" element={
            <Container maxWidth="lg">
              <AssignedKeysTable />
            </Container>
          } />
          <Route path="/migrate" element={<MigratePage />} />
          <Route path="/migrate-holders" element={<MigrateHoldersPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/parts/:id" element={<PartDetail />} />

          {/* MMS Routes */}        
          <Route path="/mms/assets" element={
            <Container maxWidth="lg">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Asset List
              </Typography>
              <AssetList />
            </Container>
          } />
          <Route path="/mms" element={
          <Container maxWidth="lg">
            <MMSOverview />
          </Container>
          } />

          <Route path="/mms/assets/:id" element={
            <Container maxWidth="lg">
              <AssetDetail />
            </Container>
          } />
          <Route path="/mms/components" element={
            <Container maxWidth="lg">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Component List
              </Typography>
              <ComponentList />
            </Container>
          } />
        </Routes>
      </Box>
      <Analytics />
    </Router>
  );
};

export default App;
