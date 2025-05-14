import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

import { useRole } from "../contexts/RoleContext";

interface Equipment {
  id: string;
  name: string;
  condition: string;
  createdAt?: any;
}

interface CustomTile {
  id: string;
  title: string;
  items: string[];
}

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <Card elevation={3} sx={{ minWidth: 180 }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardHome: React.FC = () => {
  const [assignedKeysCount, setAssignedKeysCount] = useState<number>(0);
  const [lockboxKeysCount, setLockboxKeysCount] = useState<number>(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [handToolCount, setHandToolCount] = useState<number>(0);
  const [powerToolCount, setPowerToolCount] = useState<number>(0);
  const [customTiles, setCustomTiles] = useState<CustomTile[]>([]);
  const navigate = useNavigate();
  const { role } = useRole();

  useEffect(() => {
    const fetchData = async () => {
      const assignedSnap = await getDocs(collection(db, "assignedKeys"));
      const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));
      const equipmentSnap = await getDocs(collection(db, "equipment"));
      const handToolsSnap = await getDocs(collection(db, "handTools"));
      const powerToolsSnap = await getDocs(collection(db, "powerTools"));

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
    };

    const fetchTiles = async () => {
      const snap = await getDocs(collection(db, "dashboardTiles"));
      const tiles = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CustomTile, "id">),
      }));
      setCustomTiles(tiles);
    };

    fetchData();
    fetchTiles();
  }, []);

  const brokenEquipment = equipment.filter(
    (e) =>
      e.condition?.toLowerCase().includes("broken") ||
      e.condition?.toLowerCase().includes("out of service")
  );

  const handleAddItem = async (tileId: string, newItem: string) => {
    const tile = customTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const newItems = [...tile.items, newItem];
    await updateDoc(doc(db, "dashboardTiles", tileId), {
      items: newItems,
    });

    setCustomTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: newItems } : t))
    );
  };

  const handleRemoveItem = async (tileId: string, itemIdx: number) => {
    const tile = customTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const newItems = tile.items.filter((_, i) => i !== itemIdx);
    await updateDoc(doc(db, "dashboardTiles", tileId), {
      items: newItems,
    });

    setCustomTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: newItems } : t))
    );
  };

  const handleAddTemplate = async () => {
    // Predefined template data
    const template: CustomTile = {
      id: "priorityList",
      title: "Priority List",
      items: ["Placeholder Item 1", "Placeholder Item 2", "Placeholder Item 3"],
    };

    // Add template to Firestore
    const tileRef = doc(db, "dashboardTiles", template.id);
    await setDoc(tileRef, template);

    // Update state to reflect new template
    setCustomTiles((prev) => [...prev, template]);
  };

  const handleDeleteTemplate = async (tileId: string) => {
    // Remove template from Firestore
    await deleteDoc(doc(db, "dashboardTiles", tileId));

    // Remove from local state
    setCustomTiles((prev) => prev.filter((tile) => tile.id !== tileId));
  };

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>



      <Grid container spacing={4}>
        {/* Stat Cards Row */}
        <Grid item xs={12} {...({} as any)}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Assigned Keys" value={assignedKeysCount} />
            </Grid>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Lockbox Keys" value={lockboxKeysCount} />
            </Grid>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Total Equipment" value={equipment.length} />
            </Grid>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Out of Service Equipment" value={brokenEquipment.length} />
            </Grid>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Hand Tools" value={handToolCount} />
            </Grid>
            <Grid item xs={6} sm={4} {...({} as any)}>
              <StatCard title="Power Tools" value={powerToolCount} />
            </Grid>
          </Grid>
        </Grid>

        {/* Three Column Layout for Detailed Boxes */}
        <Grid item xs={12} {...({} as any)}>
          <Grid container spacing={4}>
            {/* Out of Service Equipment */}
            <Grid item xs={12} md={4} {...({} as any)}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Out of Service Equipment
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {brokenEquipment.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      All equipment is currently in service.
                    </Typography>
                  ) : (
                    <List dense>
                      {brokenEquipment.map((item) => (
                        <ListItem key={item.id} disablePadding>
                          <ListItemText
                            primary={item.name}
                            secondary={`Condition: ${item.condition}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Custom Tiles */}
            {customTiles.map((tile) => (
              <Grid item xs={12} md={4} key={tile.id} {...({} as any)}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {tile.title}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {tile.items.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No items added yet.
                      </Typography>
                    ) : (
                      <List dense>
                        {tile.items.map((item, idx) => (
                          <ListItem
                            key={idx}
                            secondaryAction={
                              role === "admin" && (
                                <Typography
                                  component="button"
                                  color="error"
                                  sx={{ cursor: "pointer", ml: 1 }}
                                  onClick={() => handleRemoveItem(tile.id, idx)}
                                >
                                  🗑️
                                </Typography>
                              )
                            }
                          >
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {role === "admin" && (
                      <Box
                        component="form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as typeof e.target & {
                            newItem: { value: string };
                          };
                          const newItem = form.newItem.value.trim();
                          if (!newItem) return;
                          handleAddItem(tile.id, newItem);
                          form.newItem.value = "";
                        }}
                        sx={{ display: "flex", gap: 1, mt: 2 }}
                      >
                        <input
                          name="newItem"
                          placeholder="Enter new item"
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                        <button type="submit">Add</button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
