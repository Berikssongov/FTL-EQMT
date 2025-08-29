// src/components/MMS/Planning/CreatePlanModal.tsx
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
  Box,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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

type Tag = { key: string; value: string };

type Inspection = {
  id: string;
  componentId: string;
  assetId: string;
  assetName?: string;
  componentName?: string;
  date: string;
  status: string;
  tags?: Tag[];
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
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | "location" | "category" | "type">("all");
  const [usage, setUsage] = useState<Record<string, string[]>>({});

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
            let tags: Tag[] = [];

            if (insp.assetId) {
              const assetDoc = await getDoc(doc(db, "assets", insp.assetId));
              if (assetDoc.exists()) assetName = assetDoc.data().name;
            }
            if (insp.componentId) {
              const compDoc = await getDoc(doc(db, "components", insp.componentId));
              if (compDoc.exists()) {
                const compData = compDoc.data();
                componentName = compData.name;

                // parse tags: "key:value" → { key, value }
                if (Array.isArray(compData.tags)) {
                  tags = compData.tags.map((t: string) => {
                    const [key, value] = t.split(":");
                    return { key, value };
                  });
                }
              }
            }

            return { ...insp, assetName, componentName, tags } as Inspection;
          })
      );
      setFailedInspections(data);

      // build usage map (plans + workOrders)
      const usageMap: Record<string, string[]> = {};

      const planSnaps = await getDocs(collection(db, "plans"));
      planSnaps.forEach((docSnap) => {
        const data = docSnap.data();
        (data.inspections || []).forEach((id: string) => {
          usageMap[id] = [...(usageMap[id] || []), `Plan: ${data.title}`];
        });
      });

      const woSnaps = await getDocs(collection(db, "workOrders"));
      woSnaps.forEach((docSnap) => {
        const data = docSnap.data();
        (data.inspections || []).forEach((id: string) => {
          usageMap[id] = [...(usageMap[id] || []), `Work Order: ${data.title}`];
        });
      });

      setUsage(usageMap);
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
      setSearchTerm("");
      setTagFilter("all");

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to save plan:", err);
    }
  };

  // Filtering logic
  const filteredInspections = failedInspections.filter((insp) => {
    const matchesSearch =
      insp.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.componentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.tags?.some((t) => t.value.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag =
      tagFilter === "all" || insp.tags?.some((t) => t.key === tagFilter);

    return matchesSearch && matchesTag;
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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

        {/* Search & Tag Filter */}
        <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 1 }}>
          <TextField
            placeholder="Search inspections (asset, component, tag)..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Tag Filter</InputLabel>
            <Select
              value={tagFilter}
              label="Tag Filter"
              onChange={(e) =>
                setTagFilter(e.target.value as "all" | "location" | "category" | "type")
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="location">Location</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="type">Type</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Failed inspections table */}
        <TableContainer component={Paper} sx={{ maxHeight: 300, mt: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Asset</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Usage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInspections.map((insp) => (
                <TableRow key={insp.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedInspections.includes(insp.id)}
                      onChange={() => toggleInspection(insp.id)}
                    />
                  </TableCell>
                  <TableCell>{insp.assetName || "Unknown"}</TableCell>
                  <TableCell>{insp.componentName || insp.componentId}</TableCell>
                  <TableCell>{new Date(insp.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {insp.tags && insp.tags.length > 0
                      ? insp.tags.map((t) => t.value).join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {usage[insp.id] ? (
                      <Tooltip title={usage[insp.id].join(", ")} arrow>
                        <IconButton>
                          <WarningAmberIcon color="warning" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredInspections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No matching inspections
                  </TableCell>
                </TableRow>
              )}
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
