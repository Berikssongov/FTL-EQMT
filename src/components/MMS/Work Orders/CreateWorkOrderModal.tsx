// src/components/MMS/Work Orders/CreateWorkOrderModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { db } from "../../../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type Quote = {
  vendor: string;
  cost: number;
  fileName?: string;
  fileBase64?: string;
};

type Plan = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  cause?: string;
  effect?: string;
  recommendedActions?: string;
  requiredResources?: string;
  inspections?: any[];
  createdAt: string;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateWorkOrderModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [importedPlan, setImportedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const snap = await getDocs(collection(db, "plans"));
      const data = snap.docs.map((d) => {
        const planData = d.data() as Plan;
        return {
          ...planData,
          id: d.id, // ✅ only once
        };
      });
      setPlans(data);
    };
    fetchPlans();
  }, []);

  const addQuote = () => {
    setQuotes([...quotes, { vendor: "", cost: 0 }]);
  };

  const updateQuote = (index: number, key: keyof Quote, value: any) => {
    setQuotes((prev) => {
      const newQuotes = [...prev];
      (newQuotes[index] as any)[key] = value;
      return newQuotes;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    const base64 = await fileToBase64(file);
    updateQuote(index, "fileBase64", base64);
    updateQuote(index, "fileName", file.name);
  };

  const removeQuote = (index: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImportPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setTitle(plan.title || "");
      setDescription(plan.description || "");
      setImportedPlan(plan);
    }
  };

  const handleSave = async () => {
    try {
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, "workOrders"), {
        title,
        description,
        priority: importedPlan?.priority || "",
        cause: importedPlan?.cause || "",
        effect: importedPlan?.effect || "",
        recommendedActions: importedPlan?.recommendedActions || "",
        requiredResources: importedPlan?.requiredResources || "",
        inspections: importedPlan?.inspections || [],
        relatedPlanId: importedPlan?.id || null, // ✅ link back to plan
        quotes,
        status: "Draft",
        createdAt: nowIso,
      });

      // Reset form after saving
      setTitle("");
      setDescription("");
      setQuotes([]);
      setImportedPlan(null);

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to save work order:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Work Order</DialogTitle>
      <DialogContent>
        {/* Import Plan Selector */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="plan-select-label">Import from Plan</InputLabel>
          <Select
            labelId="plan-select-label"
            onChange={(e) => handleImportPlan(e.target.value)}
            value={importedPlan?.id || ""}
          >
            {plans.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Vendor Quotes Section */}
        <Box mt={2}>
          <Typography variant="h6">Vendor Quotes</Typography>
          {quotes.map((q, index) => (
            <Box key={index} sx={{ border: "1px solid #ccc", p: 2, mb: 2 }}>
              <TextField
                label="Vendor"
                fullWidth
                margin="normal"
                value={q.vendor}
                onChange={(e) => updateQuote(index, "vendor", e.target.value)}
              />
              <TextField
                label="Cost"
                type="number"
                fullWidth
                margin="normal"
                value={q.cost}
                onChange={(e) =>
                  updateQuote(index, "cost", parseFloat(e.target.value))
                }
              />

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 1 }}
              >
                {q.fileName ? `Uploaded: ${q.fileName}` : "Upload Quote PDF"}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(index, e.target.files[0]);
                    }
                  }}
                />
              </Button>

              <Box display="flex" justifyContent="flex-end">
                <IconButton color="error" onClick={() => removeQuote(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Button variant="outlined" onClick={addQuote}>
            ➕ Add Quote
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Work Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWorkOrderModal;
