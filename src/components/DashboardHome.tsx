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
  CircularProgress,
  ListItemButton,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

import TaskList from "./Tasks/TaskList";

interface Equipment {
  id: string;
  name: string;
  condition: string;
  createdAt?: any;
}

interface Inspection {
  id: string;
  componentName: string;
  assetName: string;
  timestamp: any;
  status: string;
  notes: string;
  componentId: string;
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

// ...imports remain unchanged...

const DashboardHome: React.FC = () => {
  const [assignedKeysCount, setAssignedKeysCount] = useState<number>(0);
  const [lockboxKeysCount, setLockboxKeysCount] = useState<number>(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [handToolCount, setHandToolCount] = useState<number>(0);
  const [powerToolCount, setPowerToolCount] = useState<number>(0);
  const [failedInspections, setFailedInspections] = useState<Inspection[] | null>(null);
  const navigate = useNavigate();

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

    const fetchFailedInspections = async () => {
      const allInspectionsSnap = await getDocs(collection(db, "componentInspections"));
      const allInspections = allInspectionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Inspection[];

      const latestByComponent = new Map<string, Inspection>();

      for (const inspection of allInspections) {
        const current = latestByComponent.get(inspection.componentId);
        const currentTime = current?.timestamp?.seconds ?? 0;
        const newTime = inspection.timestamp?.seconds ?? 0;

        if (!current || newTime > currentTime) {
          latestByComponent.set(inspection.componentId, inspection);
        }
      }

      const failed = Array.from(latestByComponent.values()).filter(
        (i) => i.status === "fail"
      );
      failed.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
      setFailedInspections(failed);
    };

    fetchData();
    fetchFailedInspections();
  }, []);

  const brokenEquipment = equipment.filter(e =>
    e.condition?.toLowerCase().includes("broken") ||
    e.condition?.toLowerCase().includes("out of service")
  );

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
          <Grid container spacing={4} {...({} as any)}>
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

            {/* Failed Inspections */}
            <Grid item xs={12} md={4} {...({} as any)}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Failed Inspections
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {failedInspections === null ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : failedInspections.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No failed inspections.
                    </Typography>
                  ) : (
                    <List dense>
                      {failedInspections.map((inspection) => (
                        <ListItemButton
                          key={inspection.id}
                          onClick={() => navigate(`/components/${inspection.componentId}`)}
                        >
                          <ListItemText
                            primary={`${inspection.assetName} – ${inspection.componentName}`}
                            secondary={
                              <>
                                <span>{inspection.notes}</span>
                                <br />
                                <span>
                                  {inspection.timestamp
                                    ? new Date(inspection.timestamp.seconds * 1000).toLocaleString()
                                    : "No date"}
                                </span>
                              </>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Ongoing Tasks */}
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
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;

