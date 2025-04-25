// src/components/AddEquipmentModal.tsx
import React, { useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { Equipment } from "../types";
import { addEquipment } from "../services/equipmentServices";

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  open,
  onClose,
  onAdded,
}) => {
  const [form, setForm] = useState<Equipment>({
    name: "",
    category: "",
    status: "available",
    location: "",
    notes: "",
    make: "",
    serialNumber: "",
    modelNumber: "",
    legal: {},
    engine: {},
  });

  const [hasEngine, setHasEngine] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "licensePlate" || name === "insuranceInfo") {
      setForm((prev) => ({
        ...prev,
        legal: {
          ...prev.legal,
          [name]: value,
        },
      }));
    } else if (name === "engineSerial" || name === "engineModel") {
      setForm((prev) => ({
        ...prev,
        engine: {
          ...prev.engine,
          [name === "engineSerial" ? "serialNumber" : "modelNumber"]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await addEquipment(form);
      onAdded();
      onClose();
      setForm({
        name: "",
        category: "",
        status: "available",
        location: "",
        notes: "",
        make: "",
        serialNumber: "",
        modelNumber: "",
        legal: {},
        engine: {},
      });
      setHasEngine(false);
    } catch (error) {
      console.error("Error adding equipment:", error);
    }
  };

  const showLegalFields = ["vehicle", "trailer"].includes(
    form.category?.toLowerCase()
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ backgroundColor: "rgb(43, 70, 53)", color: "rgb(206, 199, 188)" }}
      >
        Add New Equipment
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: "#fdfdfd", p: 0 }}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Grid container spacing={2} {...({} as any)}>
            {/* Name */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                required
                variant="outlined"
                value={form.name}
                onChange={handleChange}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Category"
                name="category"
                select
                fullWidth
                required
                value={form.category}
                onChange={handleChange}
                variant="outlined"
                sx={{ minWidth: 200 }} // 👈 You can adjust this width
              >
                <MenuItem value="vehicle">Vehicle</MenuItem>
                <MenuItem value="trailer">Trailer</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="landscaping">Landscaping</MenuItem>
              </TextField>
            </Grid>

            {/* Make */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Make"
                name="make"
                fullWidth
                required
                variant="outlined"
                value={form.make}
                onChange={handleChange}
              />
            </Grid>

            {/* Serial Number */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Serial Number"
                name="serialNumber"
                fullWidth
                required
                variant="outlined"
                value={form.serialNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* Model Number */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Model Number"
                name="modelNumber"
                fullWidth
                required
                variant="outlined"
                value={form.modelNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6} {...({} as any)}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                variant="outlined"
                value={form.location}
                onChange={handleChange}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12} {...({} as any)}>
              <TextField
                label="Notes"
                name="notes"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={form.notes}
                onChange={handleChange}
              />
            </Grid>

            {/* Legal Info */}
            {showLegalFields && (
              <>
                <Grid item xs={12} sm={6} {...({} as any)}>
                  <TextField
                    label="License Plate"
                    name="licensePlate"
                    fullWidth
                    variant="outlined"
                    value={form.legal?.licensePlate || ""}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} {...({} as any)}>
                  <TextField
                    label="Insurance Info"
                    name="insuranceInfo"
                    fullWidth
                    variant="outlined"
                    value={form.legal?.insuranceInfo || ""}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            {/* Engine Section Toggle */}
            <Grid item xs={12} {...({} as any)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasEngine}
                    onChange={() => setHasEngine(!hasEngine)}
                  />
                }
                label="Includes separate engine"
              />
            </Grid>

            {hasEngine && (
              <>
                <Grid item xs={12} sm={6} {...({} as any)}>
                  <TextField
                    label="Engine Serial Number"
                    name="engineSerial"
                    fullWidth
                    variant="outlined"
                    value={form.engine?.serialNumber || ""}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} {...({} as any)}>
                  <TextField
                    label="Engine Model Number"
                    name="engineModel"
                    fullWidth
                    variant="outlined"
                    value={form.engine?.modelNumber || ""}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#f8f8f8" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Equipment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEquipmentModal;
