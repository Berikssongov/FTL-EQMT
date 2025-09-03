import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { db } from "../../../firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import CreateWorkOrderModal from "./CreateWorkOrderModal";
import WorkOrderDetail from "./WorkOrderDetail";

export type Quote = {
  vendor: string;
  cost: number;
  fileName?: string;
  fileBase64?: string;
};

export type StatusHistoryEntry = {
  status: string;
  auditor: string;
  timestamp: number;
};

export type WorkOrder = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  cause?: string;
  effect?: string;
  actions?: string; // plan.actions
  resources?: string; // plan.resources
  inspections?: string[]; // array of inspection IDs
  planId?: string; // normalized plan id (we accept relatedPlanId too)
  quotes?: Quote[];
  status?: string;
  createdAt: string;
  statusHistory?: StatusHistoryEntry[];  // ✅ Added
};

const WorkOrdersPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );

  const fetchWorkOrders = async () => {
    const snap = await getDocs(collection(db, "workOrders"));

    const data: WorkOrder[] = await Promise.all(
      snap.docs.map(async (d) => {
        // avoid duplicating id keys
        const docData = d.data() as Omit<WorkOrder, "id">;
        const wo: WorkOrder = { id: d.id, ...docData };

        // support both planId and relatedPlanId for backwards compatibility
        const planRefId = (docData as any).planId || (docData as any).relatedPlanId || null;
        if (planRefId) {
          try {
            const planDoc = await getDoc(doc(db, "plans", planRefId));
            if (planDoc.exists()) {
              const plan = planDoc.data() as any;
              // only fill missing fields on the work order from the plan
              wo.description = wo.description || plan.description;
              wo.cause = wo.cause || plan.cause;
              wo.effect = wo.effect || plan.effect;
              wo.priority = wo.priority || plan.priority;
              wo.actions = wo.actions || plan.actions || plan.recommendedActions;
              wo.resources = wo.resources || plan.resources || plan.requiredResources;
              wo.inspections = wo.inspections || plan.inspections || [];
              wo.planId = planRefId; // normalize to planId
            }
          } catch (err) {
            console.error("Failed to fetch linked plan:", err);
          }
        }

        return wo;
      })
    );

    setWorkOrders(data);
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const openPDF = (base64: string) => {
    const pdfWindow = window.open();
    if (pdfWindow) {
      pdfWindow.document.write(
        `<iframe width="100%" height="100%" src="${base64}"></iframe>`
      );
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">📑 Work Orders</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + New Work Order
        </Button>
      </Box>

      <Paper>
        <List>
          {workOrders.map((wo) => (
            <React.Fragment key={wo.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setSelectedWorkOrder(wo)}
                  alignItems="flex-start"
                >
                  <ListItemText
                    primary={wo.title}
                    secondary={`Status: ${wo.status || "Draft"} — Created: ${new Date(
                      wo.createdAt
                    ).toLocaleDateString()}`}
                  />
                </ListItemButton>
              </ListItem>

              {wo.quotes && wo.quotes.length > 0 && (
                <Box pl={4} pb={2}>
                  <Typography variant="subtitle2">Quotes:</Typography>
                  {wo.quotes.map((q, i) => (
                    <Box key={i} pl={2}>
                      <Typography>
                        {q.vendor} — ${q.cost}
                        {q.fileBase64 && (
                          <Button
                            size="small"
                            onClick={() => openPDF(q.fileBase64!)}
                          >
                            View PDF
                          </Button>
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Create Modal */}
      {createOpen && (
        <CreateWorkOrderModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={fetchWorkOrders}
        />
      )}

      {/* Detail View */}
      {selectedWorkOrder && (
        <Dialog
          open={true}
          onClose={() => setSelectedWorkOrder(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Work Order Details</DialogTitle>
          <DialogContent>
            <WorkOrderDetail
              workOrder={selectedWorkOrder}
              onUpdated={fetchWorkOrders}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default WorkOrdersPage;
