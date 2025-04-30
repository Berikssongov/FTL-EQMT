import React, { useState } from "react";
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

import EquipmentList from "./components/EquipmentList";
import EquipmentDetails from "./components/EquipmentDetails";
import DashboardHome from "./components/DashboardHome";
import HandToolsList from "./components/HandToolsList";
import PowerToolsList from "./components/PowerToolsList";
import ManageLocationsPage from "./components/ManageLocationsPage"; // ✅ New

import { Settings as SettingsIcon } from "@mui/icons-material"; // ✅ Gear icon

import ServiceDetail from "./components/ServiceDetail";
import PartDetail from "./components/PartDetail";


// ---------- Header ----------
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const currentTab =
    location.pathname === "/equipment" ||
    location.pathname.startsWith("/equipment/")
      ? "/equipment"
      : location.pathname === "/hand-tools"
      ? "/hand-tools"
      : location.pathname === "/power-tools"
      ? "/power-tools"
      : "/";

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: "rgb(43, 70, 53)", // dark green
          color: "rgb(206, 199, 188)", // cobblestone
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, color: "rgb(206, 199, 188)" }}
          >
            Manage your equipment efficiently
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "rgb(206, 199, 188)" }}
          >
            FTL Equipment Manager
          </Typography>

          {/* Gear Icon for Admin Menu */}
          <Box>
            <IconButton color="inherit" onClick={handleMenuOpen} size="large">
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={() => handleMenuItemClick("/locations")}>
                Manage Locations
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          centered
          sx={{
            "& .MuiTab-root": { color: "rgb(206, 199, 188)" },
            "& .Mui-selected": { fontWeight: 600 },
          }}
        >
          <Tab label="Dashboard" value="/" />
          <Tab label="Equipment List" value="/equipment" />
          <Tab label="Hand Tools" value="/hand-tools" />
          <Tab label="Power Tools" value="/power-tools" />
        </Tabs>
      </AppBar>
    </>
  );
};

// ---------- App ----------
const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Header />

      <Box component="main" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route
            path="/equipment"
            element={
              <Container maxWidth="lg">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Equipment Inventory
                </Typography>
                <EquipmentList />
              </Container>
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <Container maxWidth="lg">
                <EquipmentDetails />
              </Container>
            }
          />
          <Route
            path="/hand-tools"
            element={
              <Container maxWidth="lg">
                <HandToolsList />
              </Container>
            }
          />
          <Route
            path="/power-tools"
            element={
              <Container maxWidth="lg">
                <PowerToolsList />
              </Container>
            }
          />
          <Route
            path="/locations"
            element={
              <Container maxWidth="lg">
                <ManageLocationsPage />
              </Container>
            }
            />
            <Route 
            path="/service/:id" 
            element={<ServiceDetail />
            } 
            />
            <Route 
            path="/parts/:id" 
            element={<PartDetail />

            }
            
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
