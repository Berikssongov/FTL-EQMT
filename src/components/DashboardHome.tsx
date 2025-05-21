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
  Button,
  IconButton,
  Stack,
  Link,
  TextField,
} from "@mui/material";
import {
  VpnKey,
  Build,
  Construction,
  Warning,
  Handyman,
  Power,
  AddCircleOutline,
  InfoOutlined,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
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

interface Finding {
  id: string;
  componentName: string;
  assetName: string;
  date: string;
  resolved?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card elevation={3} sx={{ minWidth: 180, borderLeft: `6px solid ${color}` }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box color={color}>{icon}</Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardHome: React.FC = () => {
  const [assignedKeysCount, setAssignedKeysCount] = useState(0);
  const [lockboxKeysCount, setLockboxKeysCount] = useState(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [handToolCount, setHandToolCount] = useState(0);
  const [powerToolCount, setPowerToolCount] = useState(0);
  const [dashboardTiles, setDashboardTiles] = useState<CustomTile[]>([]);
  const navigate = useNavigate();
  const { role } = useRole();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [componentsWithFindings, setComponentsWithFindings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const assignedSnap = await getDocs(collection(db, "assignedKeys"));
      const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));
      const equipmentSnap = await getDocs(collection(db, "equipment"));
      const handToolsSnap = await getDocs(collection(db, "handTools"));
      const powerToolsSnap = await getDocs(collection(db, "powerTools"));
      const tilesSnap = await getDocs(collection(db, "dashboardTiles"));
      const findingsSnap = await getDocs(collection(db, "findings"));
      const componentsSnap = await getDocs(collection(db, "components"));

const allComponents = componentsSnap.docs.map((doc) => ({
  id: doc.id,
  ...(doc.data() as any),
}));

console.log("✅ All components from Firestore:", allComponents);

const componentsWithIssues = allComponents.filter((component) => {
  const findings = component.inspection?.findings;
  const status = component.inspection?.status?.toLowerCase?.() || "";

  const hasFindings = Array.isArray(findings) && findings.length > 0;
  const isUnresolved = status === "no";

  return hasFindings && isUnresolved;

});

allComponents.forEach((component) => {
  console.log(
    "Component:",
    component.name,
    "Status:",
    component.inspection?.status,
    "Findings:",
    component.inspection?.findings
  );
});



console.log("✅ Filtered componentsWithIssues:", componentsWithIssues);
setComponentsWithFindings(componentsWithIssues);



     
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

    fetchData();
  }, []);

  const brokenEquipment = equipment.filter(
    (e) =>
      e.condition?.toLowerCase().includes("broken") ||
      e.condition?.toLowerCase().includes("out of service")
  );

  const quickInsights = [
    brokenEquipment.length > 0
      ? `${brokenEquipment.length} equipment items are out of service.`
      : "All equipment is currently operational.",
    handToolCount < 10
      ? "Low hand tool inventory—consider restocking."
      : "Hand tool inventory is healthy.",
    powerToolCount > 50
      ? "Power tool usage is high—monitor maintenance schedules."
      : "Power tool count is within normal range.",
  ];

  const handleAddItem = async (tileId: string, newItem: string) => {
    const tile = dashboardTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const newItems = [...tile.items, newItem];
    await updateDoc(doc(db, "dashboardTiles", tileId), { items: newItems });

    setDashboardTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: newItems } : t))
    );
  };

  const handleRemoveItem = async (tileId: string, itemIdx: number) => {
    const tile = dashboardTiles.find((t) => t.id === tileId);
    if (!tile) return;

    const newItems = tile.items.filter((_, i) => i !== itemIdx);
    await updateDoc(doc(db, "dashboardTiles", tileId), { items: newItems });

    setDashboardTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, items: newItems } : t))
    );
  };

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      {/* Top Row: Stat Cards (3x2) + Quick Insights */}
<Grid container spacing={3} sx={{ mb: 4 }}>
  {/* Stat Cards container (3 columns x 2 rows) */}
  <Grid item xs={12} md={8} {...({} as any)}>
    <Grid container spacing={2}>
      {[
        { title: "Assigned Keys", value: assignedKeysCount, icon: <VpnKey />, color: "#2b4635" },
        { title: "Lockbox Keys", value: lockboxKeysCount, icon: <Build />, color: "#4e6e58" },
        { title: "Total Equipment", value: equipment.length, icon: <Construction />, color: "#7a9e7e" },
        { title: "Out of Service", value: brokenEquipment.length, icon: <Warning />, color: "#c62828" },
        { title: "Hand Tools", value: handToolCount, icon: <Handyman />, color: "#6d4c41" },
        { title: "Power Tools", value: powerToolCount, icon: <Power />, color: "#283593" },
      ].map((stat, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx} {...({} as any)}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  </Grid>

  {/* Quick Insights */}
  <Grid item xs={12} md={4} {...({} as any)}>
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <InfoOutlined sx={{ mr: 1 }} />
          Quick Insights
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <List dense>
          {quickInsights.map((insight, idx) => (
            <ListItem key={idx}>
              <ListItemText primary={insight} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Grid>
</Grid>


      {/* Second Row */}
      <Grid container spacing={3}>
        {/* Findings */}
        <Grid item xs={12} md={4} {...({} as any)}>
        <Card elevation={2}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Findings Requiring Attention
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {componentsWithFindings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No outstanding findings.
        </Typography>
      ) : (
        <List dense>
  {componentsWithFindings.map((comp) => (
    <ListItem
      key={comp.id}
      component={RouterLink}
      to={`/components/${comp.id}`}
      sx={{ display: "block", cursor: "pointer" }}
    >
      <ListItemText
        primary={`${comp.name || "Unnamed Component"} — ${comp.room ?? "Unknown Room"}`}
        secondary={
          comp.inspection?.findings?.length > 0
            ? comp.inspection.findings.map((f: string) => `• ${f}`).join("\n")
            : "No findings listed"
        }
      />
    </ListItem>
  ))}
</List>

      )}
    </CardContent>
  </Card>
</Grid>



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
                        primary={
                          <Link
                            component={RouterLink}
                            to={`/equipment/${item.id}`}
                            underline="hover"
                            color="inherit"
                          >
                            {item.name}
                          </Link>
                        }
                        secondary={`Condition: ${item.condition}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tile Lists: Side-by-side */}
<Grid item xs={12} md={4} {...({} as any)}></Grid>
  <Grid container spacing={2}>
    {["priorityList", "ongoingtasks"].map((tileId) => {
      const tile = dashboardTiles.find((t) => t.id === tileId);
      if (!tile) return null;

      return (
        <Grid item xs={12} sm={6} key={tile.id} {...({} as any)}>
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
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveItem(tile.id, idx)}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
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
                  <TextField
                    name="newItem"
                    size="small"
                    placeholder="Enter new item"
                    fullWidth
                  />
                  <Button type="submit" variant="contained" size="small">
                    Add
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
</Grid>

    </Box>
  );
};

export default DashboardHome;
