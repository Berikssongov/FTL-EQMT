// src/components/layout/AppHeader.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../contexts/RoleContext"; 

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const currentTab =
    location.pathname.startsWith("/equipment") ? "/equipment"
    : location.pathname.startsWith("/hand-tools") ? "/hand-tools"
    : location.pathname.startsWith("/power-tools") ? "/power-tools"
    : location.pathname.startsWith("/keys") ? "/keys"
    : location.pathname.startsWith("/mms") ? "/mms"
    : "/";

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleNav = (path: string) => {
    navigate(path);
    handleSettingsClose();
  };
  const { role } = useRole();
  

  return (
    <>
      {/* Top White Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#ffffff", color: "#2b4635", py: 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              T.E.A.M.
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
              Tracking Equipment + Asset Management
            </Typography>
          </Box>

          <Box>
            {user ? (
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">{user.email}</Typography>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Button color="inherit" onClick={() => navigate("/login")}>
                Login / Sign Up
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Green Navigation Bar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: "rgb(43, 70, 53)",
          color: "rgb(206, 199, 188)",
          height: "50px",
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: "space-between", minHeight: 50 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              "& .MuiTab-root": { color: "rgb(206, 199, 188)" },
              "& .Mui-selected": { fontWeight: 600 },
            }}
          >
            <Tab label="Dashboard" value="/" />
            <Tab label="Equipment" value="/equipment" />
            <Tab label="Hand Tools" value="/hand-tools" />
            <Tab label="Power Tools" value="/power-tools" />
            <Tab label="Keys" value="/keys" />
            <Tab label="MMS" value="/mms" />
          </Tabs>

          <Box>
            <IconButton onClick={handleSettingsClick} sx={{ color: "rgb(206, 199, 188)" }}>
              <SettingsIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSettingsClose}>
            {role === "admin" && (
  <MenuItem onClick={() => handleNav("/locations")}>
    Manage Locations
  </MenuItem>
)}
              <MenuItem onClick={() => handleNav("/keys-assigned")}>Keys Assigned</MenuItem>
              <MenuItem onClick={() => handleNav("/keys-lockbox")}>Lockbox Keys</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default AppHeader;
