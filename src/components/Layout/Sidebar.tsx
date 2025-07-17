import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Build,
  Construction,
  VpnKey,
  ManageAccounts,
} from "@mui/icons-material";
import { useLocation, Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const drawerWidth = collapsed ? 72 : 240;

  const navItems = [
    { label: "Dashboard", icon: <Dashboard />, path: "/" },
    { label: "Equipment", icon: <Build />, path: "/equipment" },
    { label: "Hand Tools", icon: <Construction />, path: "/hand-tools" },
    { label: "Power Tools", icon: <Construction />, path: "/power-tools" },
    { label: "Keys", icon: <VpnKey />, path: "/keys" },
    { label: "MMS", icon: <ManageAccounts />, path: "/mms" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#2b4635",
          color: "#fff",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      <Toolbar />
      <List disablePadding>
        {navItems.map(({ label, icon, path }) => (
          <ListItem key={label} disablePadding>
            <Tooltip title={collapsed ? label : ""} placement="right">
              <ListItemButton
                component={Link}
                to={path}
                selected={location.pathname === path}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? "center" : "initial",
                  px: 2.5,
                  color: "#fff",
                  "&.Mui-selected": {
                    backgroundColor: "#3d5a40",
                    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                      color: "#fff",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: 0,
                    mr: collapsed ? "auto" : 2,
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#fff",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Box flexGrow={1} />
      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
      <Box textAlign="center" py={1}>
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: "#fff" }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
