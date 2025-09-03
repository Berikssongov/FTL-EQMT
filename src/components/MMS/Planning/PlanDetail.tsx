// src/components/MMS/Planning/PlanDetail.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import jsPDF from "jspdf";

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

type InspectionDetail = {
  id: string;
  date?: string;
  inspector?: string;
  notes?: string;
  status?: string;
  componentName?: string;
  room?: string | null;
  assetName?: string;
};

const PlanDetail: React.FC<Props> = ({ planId }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [inspections, setInspections] = useState<InspectionDetail[]>([]);
  const [allInspections, setAllInspections] = useState<InspectionDetail[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch plan and linked inspections
  useEffect(() => {
    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "plans", planId));
      if (!snap.exists()) return;
      const data = { id: snap.id, ...(snap.data() as any) } as Plan;
      setPlan(data);

      if (data.inspections?.length > 0) {
        const details = await fetchInspectionDetails(data.inspections);
        setInspections(details);
      }
    };
    fetchPlan();
  }, [planId]);

  // Fetch all inspections (for adding new ones)
  useEffect(() => {
    const fetchAllInspections = async () => {
      const snap = await getDocs(collection(db, "inspections"));
      const ids = snap.docs.map((d) => d.id);
      const details = await fetchInspectionDetails(ids);
      setAllInspections(details);
    };
    fetchAllInspections();
  }, []);

  // Reusable function for inspection details
  const fetchInspectionDetails = async (ids: string[]) => {
    return Promise.all(
      ids.map(async (inspId) => {
        try {
          const inspSnap = await getDoc(doc(db, "inspections", inspId));
          if (!inspSnap.exists()) return { id: inspId };

          const inspData = inspSnap.data() as any;
          let compName: string | undefined;
          let roomName: string | null = null;
          if (inspData.componentId) {
            const compSnap = await getDoc(doc(db, "components", inspData.componentId));
            if (compSnap.exists()) {
              const compData = compSnap.data() as any;
              compName = compData.name;
              roomName = compData.room || null;
            }
          }

          let assetName: string | undefined;
          if (inspData.assetId) {
            const assetSnap = await getDoc(doc(db, "assets", inspData.assetId));
            if (assetSnap.exists()) {
              assetName = (assetSnap.data() as any).name;
            }
          }

          return {
            id: inspId,
            date: inspData.date,
            inspector: inspData.inspector,
            notes: inspData.notes,
            status: inspData.status,
            componentName: compName,
            room: roomName,
            assetName,
          } as InspectionDetail;
        } catch {
          return { id: inspId };
        }
      })
    );
  };

  const handleAddInspections = async () => {
    if (!plan) return;

    const updatedInspections = Array.from(new Set([...plan.inspections, ...selectedToAdd]));
    const planRef = doc(db, "plans", plan.id);
    await updateDoc(planRef, { inspections: updatedInspections });

    // Update work orders referencing this plan
    const workOrdersSnap = await getDocs(collection(db, "workOrders"));
    for (const woDoc of workOrdersSnap.docs) {
      const woData = woDoc.data();
      if (woData.planId === plan.id) {
        const newWoInspections = Array.from(new Set([...(woData.inspections || []), ...selectedToAdd]));
        await updateDoc(woDoc.ref, { inspections: newWoInspections });
      }
    }

    const details = await fetchInspectionDetails(updatedInspections);
    setPlan({ ...plan, inspections: updatedInspections });
    setInspections(details);
    setSelectedToAdd([]);
    setAddDialogOpen(false);
  };

  const handleExportPDF = () => {
    if (!plan) return;

    const docPDF = new jsPDF();
    docPDF.setFontSize(18);
    docPDF.text(plan.title, 20, 20);
    docPDF.setFontSize(12);
    docPDF.text(`Priority: ${plan.priority}`, 20, 30);
    docPDF.text(`Created: ${new Date(plan.createdAt).toLocaleDateString()}`, 20, 40);

    let y = 55;
    const addSection = (title: string, value?: string) => {
      docPDF.setFontSize(14);
      docPDF.text(title, 20, y);
      y += 7;
      docPDF.setFontSize(12);

      const lines = docPDF.splitTextToSize(value || "—", 170);
      docPDF.text(lines, 20, y);
      y += lines.length * 7 + 5;
    };

    addSection("Description", plan.description);
    addSection("Cause", plan.cause);
    addSection("Effect", plan.effect);
    addSection("Recommended Actions", plan.actions);
    addSection("Required Resources", plan.resources);

    docPDF.setFontSize(14);
    docPDF.text("Linked Inspections:", 20, y);
    y += 10;
    inspections.forEach((ins) => {
      const text = `${ins.componentName || ins.id}${ins.room ? ` (${ins.room})` : ""} — ${
        ins.assetName || "Unknown Asset"
      }\nDate: ${ins.date ? new Date(ins.date).toLocaleDateString() : "No date"} • ${
        ins.inspector || "Unknown"
      }\n${ins.notes || "-"}`;

      const lines = docPDF.splitTextToSize(text, 170);
      docPDF.setFontSize(12);
      docPDF.text(lines, 25, y);
      y += lines.length * 7 + 5;
      if (y > 270) {
        docPDF.addPage();
        y = 20;
      }
    });

    docPDF.save(`${plan.title}.pdf`);
  };

  if (!plan) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
      <Button onClick={() => navigate("/mms#planning")} variant="outlined">
        ← Back to Planning Overview
      </Button>

      <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => setAddDialogOpen(true)}>
          + Add Inspections
        </Button>
        <Button variant="outlined" onClick={handleExportPDF}>
          Export as PDF
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5">{plan.title}</Typography>
        <Typography variant="subtitle1">Priority: {plan.priority}</Typography>
        <Typography variant="body2" color="textSecondary">
          Created: {new Date(plan.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Description</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{plan.description || "—"}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Cause</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{plan.cause || "—"}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Effect</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{plan.effect || "—"}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Recommended Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{plan.actions || "—"}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Required Resources</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{plan.resources || "—"}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Linked Inspections</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {inspections.length > 0 ? (
            inspections.map((ins) => (
              <Box key={ins.id} sx={{ mb: 1, border: "1px solid #eee", p: 2 }}>
                <Typography>
                  {ins.componentName || ins.id}
                  {ins.room ? ` (${ins.room})` : ""} — {ins.assetName || "Unknown Asset"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {ins.date ? new Date(ins.date).toLocaleString() : "No date"} •{" "}
                  {ins.inspector || "Unknown"}
                </Typography>
                <Typography sx={{ mt: 1 }}>{ins.notes || "-"}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No inspections linked.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Add Inspections Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Select Failed Inspections to Add</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Component</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allInspections
                .filter((i) => i.status === "fail" && !plan.inspections.includes(i.id))
                .map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedToAdd.includes(i.id)}
                        onChange={() =>
                          setSelectedToAdd((prev) =>
                            prev.includes(i.id)
                              ? prev.filter((id) => id !== i.id)
                              : [...prev, i.id]
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{i.componentName || i.id}</TableCell>
                    <TableCell>{i.room || "—"}</TableCell>
                    <TableCell>{i.assetName || "Unknown"}</TableCell>
                    <TableCell>
                      {i.date ? new Date(i.date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>{i.status || "—"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddInspections}>
            Add Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanDetail;
