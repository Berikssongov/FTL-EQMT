// src/components/DashboardHome.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  Grid,
  Switch,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import {
  VpnKey,
  Build,
  Construction,
  Warning,
  Handyman,
  Power,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../contexts/RoleContext";

interface Equipment {
  id: string;
  name: string;
  condition: string;
}

interface CustomTile {
  id: string;
  title: string;
  items: string[];
}

const DashboardHome = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [assignedKeysCount, setAssignedKeysCount] = useState(0);
  const [lockboxKeysCount, setLockboxKeysCount] = useState(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [handToolCount, setHandToolCount] = useState(0);
  const [powerToolCount, setPowerToolCount] = useState(0);
  const [dashboardTiles, setDashboardTiles] = useState<CustomTile[]>([]);

  const fetchData = async () => {
    const [
      assignedSnap,
      lockboxSnap,
      equipmentSnap,
      handToolsSnap,
      powerToolsSnap,
      tilesSnap,
    ] = await Promise.all([
      getDocs(collection(db, "assignedKeys")),
      getDocs(collection(db, "lockboxKeys")),
      getDocs(collection(db, "equipment")),
      getDocs(collection(db, "handTools")),
      getDocs(collection(db, "powerTools")),
      getDocs(collection(db, "dashboardTiles")),
    ]);

    setAssignedKeysCount(assignedSnap.size);
    setLockboxKeysCount(lockboxSnap.size);
    setEquipment(
      equipmentSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Equipment, "id">),
      }))
    );
    setHandToolCount(handToolsSnap.size);
    setPowerToolCount(powerToolsSnap.size);
    setDashboardTiles(
      tilesSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CustomTile, "id">),
      }))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const brokenEquipment = equipment.filter((e) =>
    ["broken", "out of service"].some((t) => e.condition?.toLowerCase().includes(t))
  );

  const handleAddItem = (tileId: string) => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newItem = (form.newItem as HTMLInputElement).value.trim();
    if (!newItem) return;

    const tile = dashboardTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const updatedItems = [...tile.items, newItem];
    await updateDoc(doc(db, "dashboardTiles", tileId), { items: updatedItems });

    setDashboardTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: updatedItems } : t))
    );

    form.reset();
  };

  const handleRemoveItem = async (tileId: string, index: number) => {
    const tile = dashboardTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const updatedItems = tile.items.filter((_, i) => i !== index);
    await updateDoc(doc(db, "dashboardTiles", tileId), { items: updatedItems });

    setDashboardTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: updatedItems } : t))
    );
  };

  const priorityList = dashboardTiles.find((t) => t.id === "priorityList");
  const ongoingTasks = dashboardTiles.find((t) => t.id === "ongoingtasks");

  return (
    <Box sx={{ p: 2, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "3fr 1fr" } }}>
      {/* Stats Tiles */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {[
          { icon: <VpnKey />, label: assignedKeysCount, sub: "ASSIGNED KEYS" },
          { icon: <Build />, label: lockboxKeysCount, sub: "LOCKBOX KEYS" },
          { icon: <Construction />, label: equipment.length, sub: "TOTAL EQUIPMENT" },
          { icon: <Warning />, label: brokenEquipment.length, sub: "OUT OF SERVICE" },
          { icon: <Handyman />, label: handToolCount, sub: "HAND TOOLS" },
          { icon: <Power />, label: powerToolCount, sub: "POWER TOOLS" },
          { icon: <Build />, label: "21°C", sub: "WEATHER" },
          { icon: <Build />, label: "10000%", sub: "BUDGET USED" },
        ].map((item, idx) => (
          <Card key={idx} sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5 }}>
            <Box sx={{ mr: 2 }}>{item.icon}</Box>
            <Box>
              <Typography variant="h6">{item.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.sub}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Right Sidebar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Card sx={{ bgcolor: "#2196f3", color: "white" }}>
          <CardContent>
            <Typography variant="h6">Elevators Status</Typography>
            <Typography variant="body1">Operations - Functioning</Typography>
            <Typography variant="body1">Big House - Non-Funcitoning </Typography>
            <Typography variant="body2">Contracting In Progress</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#4caf50", color: "white" }}>
          <CardContent>
            <Typography variant="h6">Current Weekend Assigned</Typography>
            <Typography variant="body1">July 19 (Patrick)</Typography>
            <Typography variant="body1">July 20 (Frank)</Typography>
            <Typography variant="body2">Remain Weekends: 7</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Replaced with Custom Tiles */}
      <Box sx={{ gridColumn: "1 / -1", display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mt: 1 }}>
      {priorityList && (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {priorityList.title}
      </Typography>
      <List dense disablePadding>
        {priorityList.items.map((item, idx) => (
          <ListItem
            key={idx}
            disableGutters
            sx={{ py: 0 }}
            secondaryAction={
              isAdmin && (
                <IconButton edge="end" onClick={() => handleRemoveItem(priorityList.id, idx)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
      {isAdmin && (
        <Box component="form" onSubmit={handleAddItem(priorityList.id)} mt={1}>
          <TextField name="newItem" size="small" placeholder="Add priority" fullWidth />
          <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
            Add
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>
      )}

{ongoingTasks && (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {ongoingTasks.title}
      </Typography>
      <List dense disablePadding>
        {ongoingTasks.items.map((item, idx) => (
          <ListItem
            key={idx}
            disableGutters
            sx={{ py: 0 }}
            secondaryAction={
              isAdmin && (
                <IconButton edge="end" onClick={() => handleRemoveItem(ongoingTasks.id, idx)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
      {isAdmin && (
        <Box component="form" onSubmit={handleAddItem(ongoingTasks.id)} mt={1}>
          <TextField name="newItem" size="small" placeholder="Add task" fullWidth />
          <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
            Add
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
)}
</Box>

      {/* Light/Dark Toggle Placeholder */}
      <Box sx={{ position: "fixed", top: 80, right: 20 }}>
        <Typography variant="caption">Dark Mode</Typography>
        <Switch checked={isDark} disabled />
      </Box>
    </Box>
  );
};

export default DashboardHome;
