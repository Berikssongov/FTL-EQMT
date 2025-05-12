// src/components/Inspections/RoutineMaintenanceList.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

type RoutineMaintenance = {
  id: string;
  title: string;
  recurrence: string; // e.g. "Bi-weekly", "Every 10 years", "Monthly June-Sept"
  nextDue: Timestamp;
};

type Props = {
  componentId: string;
};

const RoutineMaintenanceList: React.FC<Props> = ({ componentId }) => {
  const [tasks, setTasks] = useState<RoutineMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "routineMaintenance"),
          where("componentId", "==", componentId)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RoutineMaintenance[];
        setTasks(fetched);
      } catch (err) {
        console.error("Error fetching routine maintenance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [componentId]);

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Routine Maintenance
      </Typography>
      {tasks.length === 0 ? (
        <Typography variant="body2">
          No routine maintenance scheduled for this component.
        </Typography>
      ) : (
        tasks.map((task) => (
          <Box key={task.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {task.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Recurrence: {task.recurrence}
            </Typography>
            <Typography variant="body2">
              Next Due: {format(task.nextDue.toDate(), "yyyy-MM-dd")}
            </Typography>
            <Divider sx={{ mt: 2, mb: 2 }} />
          </Box>
        ))
      )}
    </Paper>
  );
};

export default RoutineMaintenanceList;
