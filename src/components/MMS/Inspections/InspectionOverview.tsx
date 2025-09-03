// src/components/MMS/Inspections/InspectionOverview.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { db } from "../../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import QuickAddInspectionModal from "./QuickAddInspectionModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Component = {
  id: string;
  name: string;
  assetId: string;
  assetName?: string;
  room?: string | null;
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
          const data = docSnap.data() as any;
          const comp: Component = {
            id: docSnap.id,
            name: data.name,
            assetId: data.assetId,
            assetName: undefined,
            room: data.room ?? null,
            frequency: data.frequency,
            lastChecked: data.lastChecked ?? null,
            nextDue: data.nextDue ?? null,
            status: data.status,
          };

          if (comp.assetId) {
            const assetDoc = await getDoc(doc(db, "assets", comp.assetId));
            if (assetDoc.exists()) {
              comp.assetName = (assetDoc.data() as any).name;
            }
          }
          return comp;
        })
      );

      const overdueComps = comps.filter((c) => {
        if (!c.nextDue) return true;
        const dueDate = new Date(c.nextDue);
        return dueDate < now;
      });

      const upcomingComps = comps.filter((c) => {
        if (!c.nextDue) return false;
        const dueDate = new Date(c.nextDue);
        const diff = dueDate.getTime() - now.getTime();
        return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 30;
      });

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

  const renderSecondary = (
    comp: Component,
    mode: "overdue" | "upcoming" | "recent"
  ) => {
    if (mode === "overdue") {
      return `Asset: ${comp.assetName || "Unknown"} — Room: ${
        comp.room || "-"
      } — Next Due: ${comp.nextDue || "Not inspected yet"}`;
    }
    if (mode === "upcoming") {
      return `Asset: ${comp.assetName || "Unknown"} — Room: ${
        comp.room || "-"
      } — Next Due: ${comp.nextDue || "-"}`;
    }
    return `Asset: ${comp.assetName || "Unknown"} — Room: ${
      comp.room || "-"
    } — Last Checked: ${comp.lastChecked || "-"}`;
  };

  return (
    <Box>
      {/* Overdue */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">❌ Overdue Inspections ({overdue.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
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
                    secondary={renderSecondary(comp, "overdue")}
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
        </AccordionDetails>
      </Accordion>

      {/* Upcoming */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">⏳ Upcoming Inspections ({upcoming.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {upcoming.map((comp) => {
              const dueDate = comp.nextDue ? new Date(comp.nextDue) : null;
              const withinAWeek =
                !!dueDate &&
                dueDate.getTime() - new Date().getTime() <=
                  1000 * 60 * 60 * 24 * 7;

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
                      secondary={renderSecondary(comp, "upcoming")}
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
        </AccordionDetails>
      </Accordion>

      {/* Recent */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            ✅ Recently Checked Components ({recent.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {recent.map((comp) => (
              <ListItem key={comp.id}>
                <ListItemText
                  primary={comp.name}
                  secondary={renderSecondary(comp, "recent")}
                />
              </ListItem>
            ))}
            {recent.length === 0 && (
              <Typography>No components checked in the last 30 days.</Typography>
            )}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Quick Add Modal */}
      {selectedComponent && (
        <QuickAddInspectionModal
          open={true}
          onClose={() => setSelectedComponent(null)}
          componentId={selectedComponent.id}
          componentName={selectedComponent.name}
          onSaved={() => {
            setSelectedComponent(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}
    </Box>
  );
};

export default InspectionOverview;
