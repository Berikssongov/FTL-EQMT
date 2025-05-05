// src/App.tsx
import { Analytics } from "@vercel/analytics/react"
import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Settings as SettingsIcon } from "@mui/icons-material";

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



// ---------- Header ----------
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const currentTab =
    location.pathname.startsWith("/equipment") ? "/equipment"
    : location.pathname.startsWith("/hand-tools") ? "/hand-tools"
    : location.pathname.startsWith("/power-tools") ? "/power-tools"
    : location.pathname.startsWith("/keys") ? "/keys"
    : "/";

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToLocations = () => {
    navigate("/locations");
    handleSettingsClose();
  };

  const handleNavigateToKeysAssigned = () => {
    navigate("/keys-assigned");
    handleSettingsClose();
  };

  const handleNavigateToLockboxKeys = () => {
    navigate("/keys-lockbox");
    handleSettingsClose();
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "rgb(43, 70, 53)",
        color: "rgb(206, 199, 188)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="body1" sx={{ color: "rgb(206, 199, 188)" }}>
          Manage your equipment efficiently
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "rgb(206, 199, 188)" }}>
          FTL Equipment Manager
        </Typography>

        <Box>
          <IconButton onClick={handleSettingsClick} sx={{ color: "rgb(206, 199, 188)" }}>
            <SettingsIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSettingsClose}>
            <MenuItem onClick={handleNavigateToLocations}>Manage Locations</MenuItem>
            <MenuItem onClick={handleNavigateToKeysAssigned}>Keys Assigned</MenuItem>
            <MenuItem onClick={handleNavigateToLockboxKeys}>Lockbox Keys</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          indicatorColor="secondary"
          textColor="inherit"
          sx={{
            "& .MuiTab-root": { color: "rgb(206, 199, 188)" },
            "& .Mui-selected": { fontWeight: 600 },
            maxWidth: "100vw",
          }}
        >
          <Tab label="Dashboard" value="/" />
          <Tab label="Equipment List" value="/equipment" />
          <Tab label="Hand Tools" value="/hand-tools" />
          <Tab label="Power Tools" value="/power-tools" />
          <Tab label="Keys" value="/keys" />
        </Tabs>
      </Box>
    </AppBar>
  );
};

// ---------- App ----------
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
      <Header />

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
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
<Analytics />
