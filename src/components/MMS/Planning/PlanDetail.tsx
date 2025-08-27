import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

type Props = {
  planId: string;
};

type Plan = {
  id: string;
  title: string;
  priority: string;
  description?: string;
  cause?: string;
  effect?: string;
  actions?: string;
  resources?: string;
  inspections: string[];
  createdAt: string;
};

const PlanDetail: React.FC<Props> = ({ planId }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "plans", planId));
      if (!snap.exists()) return;
      const data = { id: snap.id, ...(snap.data() as any) } as Plan;
      setPlan(data);

      // fetch related inspections
      const related: any[] = [];
      for (const inspId of data.inspections || []) {
        const inspSnap = await getDoc(doc(db, "inspections", inspId));
        if (inspSnap.exists()) {
          related.push({ id: inspSnap.id, ...inspSnap.data() });
        }
      }
      setInspections(related);
    };
    fetchPlan();
  }, [planId]);

  if (!plan) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        ← Back to Planning Overview
      </Button>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5">{plan.title}</Typography>
        <Typography variant="subtitle1">Priority: {plan.priority}</Typography>
        <Typography variant="body2" color="textSecondary">
          Created: {new Date(plan.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Description</Typography>
        <Typography>{plan.description || "—"}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6">Cause</Typography>
        <Typography>{plan.cause || "—"}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6">Effect</Typography>
        <Typography>{plan.effect || "—"}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6">Recommended Actions</Typography>
        <Typography>{plan.actions || "—"}</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6">Required Resources</Typography>
        <Typography>{plan.resources || "—"}</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Linked Inspections</Typography>
        <List>
          {inspections.map((insp) => (
            <ListItem key={insp.id}>
              <ListItemText
                primary={`${insp.componentId} — ${insp.status}`}
                secondary={`Date: ${new Date(insp.date).toLocaleDateString()} • Inspector: ${
                  insp.inspector
                } • Notes: ${insp.notes || "-"}`}
              />
            </ListItem>
          ))}
          {inspections.length === 0 && (
            <Typography>No inspections linked.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default PlanDetail;
