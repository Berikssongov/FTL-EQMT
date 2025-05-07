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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import TaskList from "./Tasks/TaskList";

interface Equipment {
  id: string;
  name: string;
  condition: string;
  createdAt?: any;
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

  useEffect(() => {
    const fetchData = async () => {
      const assignedSnap = await getDocs(collection(db, "assignedKeys"));
      const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));
      const equipmentSnap = await getDocs(collection(db, "equipment"));
      const handToolsSnap = await getDocs(collection(db, "handTools"));
      const powerToolsSnap = await getDocs(collection(db, "powerTools"));

      setAssignedKeysCount(assignedSnap.size);
      setLockboxKeysCount(lockboxSnap.size);
      setEquipment(equipmentSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Equipment, "id">)
      })));
      setHandToolCount(handToolsSnap.size);
      setPowerToolCount(powerToolsSnap.size);
    };

    fetchData();
  }, []);

  const brokenEquipment = equipment.filter(e =>
    e.condition?.toLowerCase().includes("broken") ||
    e.condition?.toLowerCase().includes("out of service")
  );

  const recentEquipment = [...equipment]
    .sort((a, b) => {
      const aDate = a.createdAt?.seconds ?? 0;
      const bDate = b.createdAt?.seconds ?? 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT: Task List */}
        <Grid item xs={12} md={4} {...({} as any)}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ongoing Tasks & Priorities
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TaskList listStyle />
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Dashboard Stats and Widgets */}
        <Grid item xs={12} md={8} {...({} as any)}>
          {/* Stat Cards */}
          <Grid container spacing={2} mb={4}>
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

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} {...({} as any)}>
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
                      {brokenEquipment.slice(0, 5).map((item) => (
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

            <Grid item xs={12} sm={6} {...({} as any)}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recently Added Equipment
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {recentEquipment.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No new equipment added recently.
                    </Typography>
                  ) : (
                    <List dense>
                      {recentEquipment.map((item) => (
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
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
