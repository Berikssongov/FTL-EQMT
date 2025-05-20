import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import AddComponentModal from "./AddComponentModal";
import { format } from "date-fns";

type Props = {
  assetId: string;
  assetName: string;
};

type ComponentItem = {
  id: string;
  name: string;
  type: string;
  location?: string;
  category?: string;
  condition?: string;
  room?: string;
  inspection: {
    frequency: string;
    lastChecked: string | null;
    nextDue: string | null;
    status: string;
  };
};

const ComponentList: React.FC<Props> = ({ assetId }) => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "components");
      const q = query(ref, where("assetId", "==", assetId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ComponentItem[];
      setComponents(list);
    } catch (err) {
      console.error("Error loading components:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [assetId]);

  const exterior = components.filter(c => (c.location || '').toLowerCase() === "exterior");
  const interior = components.filter(c => (c.location || '').toLowerCase() !== "exterior");

  const groupByRoom = (comps: ComponentItem[]) => {
    const grouped: { [room: string]: ComponentItem[] } = {};
    comps.forEach(c => {
      const room = c.room || "Unassigned Room";
      if (!grouped[room]) grouped[room] = [];
      grouped[room].push(c);
    });
    return grouped;
  };

  const renderComponentCard = (comp: ComponentItem) => (
    <Paper
      key={comp.id}
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": { backgroundColor: "#f5f5f5" },
      }}
      onClick={() => navigate(`/components/${comp.id}`)}
    >
      <Typography
        variant="subtitle1"
        fontWeight={500}
        color={comp.inspection?.status === "fail" ? "error" : "textPrimary"}
      >
        {comp.name}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Type: {comp.type} • Category: {comp.category} • Location: {comp.location}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Condition: {comp.condition} • Next Inspection: {comp.inspection?.nextDue
          ? format(new Date(comp.inspection.nextDue), "yyyy-MM-dd")
          : "Not set"}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">🧩 Components</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add Component
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : components.length === 0 ? (
        <Typography color="textSecondary">No components found.</Typography>
      ) : (
        <Box>
          {/* Exterior section */}
          {exterior.length > 0 && (
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Exterior Components</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {exterior.map(renderComponentCard)}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Interior section grouped by room */}
          {Object.entries(groupByRoom(interior)).map(([room, comps]) => (
            <Accordion key={room} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Room: {room}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {comps.map(renderComponentCard)}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <AddComponentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchComponents();
        }}
        assetId={assetId}
      />
    </Box>
  );
};

export default ComponentList;
