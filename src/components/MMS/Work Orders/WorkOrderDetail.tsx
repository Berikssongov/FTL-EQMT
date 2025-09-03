import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { WorkOrder, Quote, StatusHistoryEntry } from "./WorkOrdersPage";
import { useAuth } from "../../../contexts/AuthContext";

type Props = {
  workOrder?: WorkOrder; // If passed, use directly
  workOrderId?: string; // If passed, fetch from Firestore
  onUpdated?: () => Promise<void> | void;
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const WorkOrderDetail: React.FC<Props> = ({
  workOrder,
  workOrderId,
  onUpdated,
}) => {
  const { user, firstName, lastName } = useAuth();
  const inspector =
    (firstName && lastName
      ? `${firstName} ${lastName}`
      : user?.email || user?.uid) || "Unknown";

  const [loadedWorkOrder, setLoadedWorkOrder] = useState<WorkOrder | null>(
    workOrder || null
  );
  const [newQuote, setNewQuote] = useState<Quote>({
    vendor: "",
    cost: 0,
    fileName: "",
    fileBase64: "",
  });
  const [inspectionsDetails, setInspectionsDetails] = useState<
    InspectionDetail[]
  >([]);

  // Fetch if only id is provided
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (workOrderId && !workOrder) {
        const docRef = doc(db, "workOrders", workOrderId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as Omit<WorkOrder, "id">;
          setLoadedWorkOrder({ id: snap.id, ...data });
        }
      } else if (workOrder) {
        setLoadedWorkOrder(workOrder);
      }
    };
    fetchWorkOrder();
  }, [workOrderId, workOrder]);

  // When work order is loaded, fetch linked inspections details if any
  useEffect(() => {
    const fetchInspectionDetails = async () => {
      const current = loadedWorkOrder;
      if (!current?.inspections || current.inspections.length === 0) {
        setInspectionsDetails([]);
        return;
      }

      const details: InspectionDetail[] = await Promise.all(
        current.inspections.map(async (inspId: string) => {
          try {
            const inspSnap = await getDoc(doc(db, "inspections", inspId));
            if (!inspSnap.exists()) return { id: inspId };

            const inspData = inspSnap.data() as any;
            const compId = inspData.componentId;
            const assetId = inspData.assetId;

            let compName: string | undefined;
            let roomName: string | null = null;
            if (compId) {
              const compSnap = await getDoc(doc(db, "components", compId));
              if (compSnap.exists()) {
                const compData = compSnap.data() as any;
                compName = compData.name;
                roomName = compData.room || null;
              }
            }

            let assetName: string | undefined;
            if (assetId) {
              const assetSnap = await getDoc(doc(db, "assets", assetId));
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
          } catch (err) {
            console.error("Error loading inspection detail", inspId, err);
            return { id: inspId };
          }
        })
      ).catch((e) => {
        console.error("Error fetching inspection details:", e);
        return [];
      });

      setInspectionsDetails(details);
    };

    fetchInspectionDetails();
  }, [loadedWorkOrder?.inspections]);

  const handleAddQuote = async () => {
    const targetId = loadedWorkOrder?.id;
    if (!targetId || !newQuote.vendor || !newQuote.cost) return;

    const docRef = doc(db, "workOrders", targetId);
    await updateDoc(docRef, {
      quotes: arrayUnion(newQuote),
    });

    setLoadedWorkOrder((prev: WorkOrder | null) =>
      prev ? { ...prev, quotes: [...(prev.quotes || []), newQuote] } : prev
    );

    setNewQuote({ vendor: "", cost: 0, fileName: "", fileBase64: "" });
    await onUpdated?.();
  };

  const handleRemoveQuote = async (quoteToRemove: Quote) => {
    const targetId = loadedWorkOrder?.id;
    if (!targetId) return;

    const docRef = doc(db, "workOrders", targetId);
    await updateDoc(docRef, {
      quotes: arrayRemove(quoteToRemove),
    });

    setLoadedWorkOrder((prev: WorkOrder | null) =>
      prev
        ? { ...prev, quotes: prev.quotes?.filter((q: Quote) => q !== quoteToRemove) }
        : prev
    );
    await onUpdated?.();
  };

  const handleFileUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    setNewQuote((prev) => ({
      ...prev,
      fileName: file.name,
      fileBase64: base64,
    }));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!loadedWorkOrder?.id) return;
    const docRef = doc(db, "workOrders", loadedWorkOrder.id);

    const newEntry: StatusHistoryEntry = {
      status: newStatus,
      auditor: inspector,
      timestamp: Date.now(), // ✅ number, consistent
    };

    await updateDoc(docRef, {
      status: newStatus,
      statusHistory: arrayUnion(newEntry),
    });

    setLoadedWorkOrder((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            statusHistory: [...(prev.statusHistory || []), newEntry],
          }
        : prev
    );

    await onUpdated?.();
  };

  if (!loadedWorkOrder) {
    return <Typography>Loading Work Order...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 2 }}>
      <Typography variant="h5" gutterBottom>
        {loadedWorkOrder.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {loadedWorkOrder.description || "No description provided"}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Plan Details</Typography>
      <Typography>Priority: {loadedWorkOrder.priority || "N/A"}</Typography>
      <Typography>Cause: {loadedWorkOrder.cause || "N/A"}</Typography>
      <Typography>Effect: {loadedWorkOrder.effect || "N/A"}</Typography>
      <Typography>Actions: {loadedWorkOrder.actions || "N/A"}</Typography>
      <Typography>Resources: {loadedWorkOrder.resources || "N/A"}</Typography>

      <Divider sx={{ my: 2 }} />

      {/* Inspections Accordion */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Inspections ({inspectionsDetails.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {inspectionsDetails.length > 0 ? (
            inspectionsDetails.map((ins) => (
              <Box key={ins.id} sx={{ mb: 2, border: "1px solid #eee", p: 2 }}>
                <Typography>
                  {ins.componentName || ins.id}
                  {ins.room ? ` (${ins.room})` : ""} —{" "}
                  {ins.assetName || "Unknown Asset"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {ins.date
                    ? new Date(ins.date).toLocaleString()
                    : "No date"}{" "}
                  • {ins.inspector || "Unknown"}
                </Typography>
                <Typography sx={{ mt: 1 }}>{ins.notes || "-"}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No linked inspections.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Status History Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Status History</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadedWorkOrder.statusHistory &&
          loadedWorkOrder.statusHistory.length > 0 ? (
            <List>
              {loadedWorkOrder.statusHistory.map(
                (entry: StatusHistoryEntry, idx: number) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${new Date(
                        entry.timestamp
                      ).toLocaleString()} — ${entry.status}`}
                      secondary={`Auditor: ${entry.auditor}`}
                    />
                  </ListItem>
                )
              )}
            </List>
          ) : (
            <Typography>No status history yet.</Typography>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Update Status</Typography>
            <Select
              fullWidth
              value={loadedWorkOrder.status || ""}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Quotes Section */}
      <Typography variant="h6">Vendor Quotes</Typography>
      {loadedWorkOrder.quotes && loadedWorkOrder.quotes.length > 0 ? (
        loadedWorkOrder.quotes.map((q: Quote, index: number) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #ccc",
              p: 2,
              my: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography>Vendor: {q.vendor}</Typography>
              <Typography>
                Cost: ${q.cost?.toFixed?.(2) ?? q.cost}
              </Typography>
              {q.fileBase64 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const win = window.open();
                    if (win)
                      win.document.write(
                        `<iframe src="${q.fileBase64}" width="100%" height="100%"></iframe>`
                      );
                  }}
                >
                  View PDF
                </Button>
              )}
            </Box>
            <IconButton color="error" onClick={() => handleRemoveQuote(q)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))
      ) : (
        <Typography>No quotes added yet.</Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">➕ Add New Quote</Typography>
      <TextField
        label="Vendor"
        fullWidth
        margin="normal"
        value={newQuote.vendor}
        onChange={(e) =>
          setNewQuote((prev) => ({ ...prev, vendor: e.target.value }))
        }
      />
      <TextField
        label="Cost"
        type="number"
        fullWidth
        margin="normal"
        value={newQuote.cost}
        onChange={(e) =>
          setNewQuote((prev) => ({
            ...prev,
            cost: parseFloat(e.target.value) || 0,
          }))
        }
      />
      <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
        {newQuote.fileName
          ? `Uploaded: ${newQuote.fileName}`
          : "Upload Quote PDF"}
        <input
          type="file"
          hidden
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          }}
        />
      </Button>
      <Button sx={{ mt: 2 }} variant="contained" onClick={handleAddQuote}>
        Save Quote
      </Button>
    </Box>
  );
};

export default WorkOrderDetail;
