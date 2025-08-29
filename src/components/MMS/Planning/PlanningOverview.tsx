import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  ListItemButton,
} from "@mui/material";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CreatePlanModal from "./CreatePlanModal";

type Plan = {
  id: string;
  title: string;
  priority: string;
  description?: string;
  createdAt: string;
};

const PlanningOverview: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    const snap = await getDocs(collection(db, "plans"));
    const docs: Plan[] = snap.docs.map((d) => ({
      ...(d.data() as Plan),
      id: d.id, //
    }));
    setPlans(docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <Box>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setOpenModal(true)}
      >
        Create New Plan
      </Button>

      <Paper>
      <List>
  {plans.map((plan) => (
    <ListItem key={plan.id} disablePadding>
      <ListItemButton onClick={() => navigate(`/mms/planning/${plan.id}`)}>
        <ListItemText
          primary={`${plan.title} — Priority: ${plan.priority}`}
          secondary={`${plan.description || "No description"} • Created: ${
            new Date(plan.createdAt).toLocaleDateString()
          }`}
        />
      </ListItemButton>
    </ListItem>
  ))}
  {plans.length === 0 && (
    <Typography sx={{ p: 2 }}>No plans created yet.</Typography>
  )}
</List>
      </Paper>

      <CreatePlanModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={fetchPlans}
      />
    </Box>
  );
};

export default PlanningOverview;
