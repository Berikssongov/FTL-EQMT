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
  Button,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useRole } from "../../contexts/RoleContext";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { role } = useRole();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: "#ffffff", color: "#2b4635" }}>
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            T.E.A.M.
          </Typography>
          <Typography variant="caption">Tracking Equipment + Asset Management</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {user ? (
            <>
              <Typography variant="body2">{user.email}</Typography>
              <IconButton onClick={handleSettingsClick} sx={{ color: "#2b4635" }}>
                <SettingsIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSettingsClose}>
                {role === "admin" && (
                  <MenuItem onClick={() => handleNav("/locations")}>Manage Locations</MenuItem>
                )}
                <MenuItem onClick={() => handleNav("/keys-assigned")}>Keys Assigned</MenuItem>
                <MenuItem onClick={() => handleNav("/keys-lockbox")}>Lockbox Keys</MenuItem>
                {role === "admin" && (
                  <MenuItem onClick={() => handleNav("/settings/backup")}>Backup & Restore</MenuItem>
                )}
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login / Sign Up
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
