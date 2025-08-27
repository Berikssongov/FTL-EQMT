import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from "@mui/material";
import { db } from "../../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type Inspection = {
  id: string;
  componentId: string;
  assetId: string;
  assetName?: string;
  componentName?: string;
  date: string;
  inspector: string;
  notes?: string;
  status: string;
};

const CreatePlanModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [effect, setEffect] = useState("");
  const [actions, setActions] = useState("");
  const [resources, setResources] = useState("");
  const [failedInspections, setFailedInspections] = useState<Inspection[]>([]);
  const [selectedInspections, setSelectedInspections] = useState<string[]>([]);

  // fetch failed inspections
  useEffect(() => {
    const fetchFailed = async () => {
      const snap = await getDocs(collection(db, "inspections"));
      const data: Inspection[] = await Promise.all(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((insp) => insp.status === "fail")
          .map(async (insp: any) => {
            let assetName: string | undefined;
            let componentName: string | undefined;

            if (insp.assetId) {
              const assetDoc = await getDoc(doc(db, "assets", insp.assetId));
              if (assetDoc.exists()) assetName = assetDoc.data().name;
            }
            if (insp.componentId) {
              const compDoc = await getDoc(doc(db, "components", insp.componentId));
              if (compDoc.exists()) componentName = compDoc.data().name;
            }
            return { ...insp, assetName, componentName } as Inspection;
          })
      );
      setFailedInspections(data);
    };
    if (open) fetchFailed();
  }, [open]);

  const toggleInspection = (id: string) => {
    setSelectedInspections((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, "plans"), {
        title,
        priority,
        description,
        cause,
        effect,
        actions,
        resources,
        inspections: selectedInspections,
        createdAt: nowIso,
      });

      // reset after save
      setTitle("");
      setPriority("medium");
      setDescription("");
      setCause("");
      setEffect("");
      setActions("");
      setResources("");
      setSelectedInspections([]);

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to save plan:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Plan</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          select
          label="Priority"
          fullWidth
          margin="normal"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          label="Cause"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={cause}
          onChange={(e) => setCause(e.target.value)}
        />

        <TextField
          label="Effect"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
        />

        <TextField
          label="Recommended Actions"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={actions}
          onChange={(e) => setActions(e.target.value)}
        />

        <TextField
          label="Required Resources"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={resources}
          onChange={(e) => setResources(e.target.value)}
        />

        {/* Failed inspections table */}
        <TableContainer component={Paper} sx={{ maxHeight: 300, mt: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Asset</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Inspector</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {failedInspections.map((insp) => (
                <TableRow key={insp.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedInspections.includes(insp.id)}
                      onChange={() => toggleInspection(insp.id)}
                    />
                  </TableCell>
                  <TableCell>{insp.assetName || "Unknown"}</TableCell>
                  <TableCell>{insp.componentName || insp.componentId}</TableCell>
                  <TableCell>
                    {new Date(insp.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{insp.inspector}</TableCell>
                  <TableCell>{insp.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlanModal;
