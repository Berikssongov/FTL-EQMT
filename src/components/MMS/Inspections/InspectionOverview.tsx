// src/components/MMS/Inspections/InspectionOverview.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import { db } from "../../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import QuickAddInspectionModal from "./QuickAddInspectionModal";

type Component = {
  id: string;
  name: string;
  assetId: string;
  assetName?: string;
  frequency?: string;
  lastChecked?: string | null;
  nextDue?: string | null;
  status?: string;
};

const InspectionOverview: React.FC = () => {
  const [overdue, setOverdue] = useState<Component[]>([]);
  const [upcoming, setUpcoming] = useState<Component[]>([]);
  const [recent, setRecent] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "components"));
      const now = new Date();

      const comps: Component[] = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data() as Omit<Component, "id">;
          const comp: Component = { id: docSnap.id, ...data };

          // fetch asset name for context
          if (comp.assetId) {
            const assetDoc = await getDoc(doc(db, "assets", comp.assetId));
            if (assetDoc.exists()) {
              comp.assetName = (assetDoc.data() as any).name;
            }
          }
          return comp;
        })
      );

      // overdue = no nextDue OR nextDue < today
      const overdueComps = comps.filter((c) => {
        if (!c.nextDue) return true;
        const dueDate = new Date(c.nextDue);
        return dueDate < now;
      });

      // upcoming = due date in the next 30 days
      const upcomingComps = comps.filter((c) => {
        if (!c.nextDue) return false;
        const dueDate = new Date(c.nextDue);
        const diff = dueDate.getTime() - now.getTime();
        return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 30; // within 30 days
      });

      // recent = lastChecked within the last 30 days
      const recentComps = comps.filter((c) => {
        if (!c.lastChecked) return false;
        const checked = new Date(c.lastChecked);
        const diff = now.getTime() - checked.getTime();
        return diff <= 1000 * 60 * 60 * 24 * 30;
      });

      setOverdue(overdueComps);
      setUpcoming(upcomingComps);
      setRecent(recentComps);
    };

    fetchData();
  }, [refreshKey]);

  return (
    <Box>
      {/* Overdue */}
<Paper sx={{ p: 2, mb: 3 }}>
  <Typography variant="h6">❌ Overdue Inspections</Typography>
  <List>
    {overdue.map((comp) => (
      <React.Fragment key={comp.id}>
        <ListItem
          secondaryAction={
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedComponent(comp)}
            >
              Inspect
            </Button>
          }
        >
          <ListItemText
            primary={comp.name}
            secondary={`Asset: ${
              comp.assetName || "Unknown"
            } — Next Due: ${comp.nextDue || "Not inspected yet"}`}
          />
        </ListItem>
        <Divider />
      </React.Fragment>
    ))}
    {overdue.length === 0 && (
      <Typography variant="body2" color="textSecondary">
        ✅ No overdue inspections!
      </Typography>
    )}
  </List>
</Paper>

{/* Upcoming */}
<Paper sx={{ p: 2, mb: 3 }}>
  <Typography variant="h6">⏳ Upcoming Inspections</Typography>
  <List>
    {upcoming.map((comp) => {
      const dueDate = comp.nextDue ? new Date(comp.nextDue) : null;
      const withinAWeek =
        dueDate &&
        dueDate.getTime() - new Date().getTime() <= 1000 * 60 * 60 * 24 * 7;

      return (
        <React.Fragment key={comp.id}>
          <ListItem
            secondaryAction={
              withinAWeek && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedComponent(comp)}
                >
                  Inspect
                </Button>
              )
            }
          >
            <ListItemText
              primary={comp.name}
              secondary={`Asset: ${
                comp.assetName || "Unknown"
              } — Next Due: ${comp.nextDue || "-"}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      );
    })}
    {upcoming.length === 0 && (
      <Typography variant="body2" color="textSecondary">
        No inspections due soon.
      </Typography>
    )}
  </List>
</Paper>

      {/* Recent */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">✅ Recent Inspections</Typography>
        <List>
          {recent.map((comp) => (
            <ListItem key={comp.id}>
              <ListItemText
                primary={comp.name}
                secondary={`Asset: ${comp.assetName || "Unknown"} — Last Checked: ${
                  comp.lastChecked || "-"
                }`}
              />
            </ListItem>
          ))}
          {recent.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No recent inspections.
            </Typography>
          )}
        </List>
      </Paper>

      {/* Quick Add Modal */}
      {selectedComponent && (
        <QuickAddInspectionModal
          open={true}
          onClose={() => setSelectedComponent(null)}
          componentId={selectedComponent.id}
          componentName={selectedComponent.name}
          onSaved={() => {
            setSelectedComponent(null);
            setRefreshKey((prev) => prev + 1); // trigger refetch
          }}
        />
      )}
    </Box>
  );
};

export default InspectionOverview;
