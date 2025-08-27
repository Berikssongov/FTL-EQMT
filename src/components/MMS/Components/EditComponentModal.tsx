import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { ComponentData } from "./ComponentDetail";

interface EditComponentModalProps {
  open: boolean;
  component: ComponentData;
  onClose: () => void;
  onSave: (updated: Partial<ComponentData>) => void;
}

const EditComponentModal: React.FC<EditComponentModalProps> = ({
  open,
  component,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ComponentData>(component);

  const frequencyOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi-annually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "5-years", label: "Every 5 Years" },
  ];

  const handleChange = (field: keyof ComponentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "components", component.id);
      await updateDoc(ref, {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
        tags: formData.tags,
        frequency: formData.frequency || null,
      });
      onSave(formData);
      onClose();
    } catch (err) {
      console.error("❌ Failed to update component:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Component</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <TextField
          margin="dense"
          label="Type"
          fullWidth
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
        />
        <TextField
          margin="dense"
          label="Category"
          fullWidth
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />
        <TextField
          margin="dense"
          label="Location"
          fullWidth
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
        <TextField
          margin="dense"
          label="Condition"
          fullWidth
          value={formData.condition}
          onChange={(e) => handleChange("condition", e.target.value)}
        />
        <TextField
  select
  margin="dense"
  label="Inspection Frequency"
  fullWidth
  value={formData.frequency || ""}
  onChange={(e) => handleChange("frequency", e.target.value)}
>
  {frequencyOptions.map((opt) => (
    <MenuItem key={opt.value} value={opt.value}>
      {opt.label}
    </MenuItem>
  ))}
</TextField>
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

export default EditComponentModal;
