import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Chip,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

import { useRole } from "../../../contexts/RoleContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  assetId: string;
}

const AddComponentModal: React.FC<Props> = ({ open, onClose, onSaved, assetId }) => {
  const { role, loading: roleLoading } = useRole(); // Get the role using the hook

  // If role is still loading, show a loading spinner
  if (roleLoading) {
    return <CircularProgress />;
  }

  // Check if the user is an admin
  if (role !== "admin") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          You do not have permission to add components. Only admins can do that.
        </Typography>
      </Box>
    );
  }

  const [name, setName] = useState("");
  const [type, setType] = useState("__unset__");
  const [location, setLocation] = useState("__unset__");
  const [category, setCategory] = useState("__unset__");
  const [frequency, setFrequency] = useState("__unset__");
  const [tags, setTags] = useState<string[]>([]);
  const [condition, setCondition] = useState("__unset__");
  const [error, setError] = useState("");

  const exteriorCategories = ["Weather Envelope", "Structure", "Landscaping", "Other"];
  const interiorCategories = ["Fixtures", "Finishes", "HVAC", "Electrical", "Plumbing", "Other"];

  const typeMap: Record<string, string[]> = {
    "Weather Envelope": ["Roofing", "Siding", "Gutters"],
    Structure: ["Decks", "Foundation", "Stairs"],
    Landscaping: ["Grass", "Shrubs", "Irrigation"],
    Fixtures: ["Lights", "Outlets"],
    HVAC: ["Heater", "AC Unit"],
    Plumbing: ["Toilet", "Sink"],
  };

  const categoryOptions =
    location === "Exterior" ? exteriorCategories :
    location === "Interior" ? interiorCategories : [];

  const itemTypeOptions = typeMap[category] || [];

  const updateTag = (prefix: "location" | "category" | "type", value: string) => {
    if (!value || value === "__unset__") return;
    const filtered = tags.filter(tag => !tag.startsWith(`${prefix}:`));
    setTags([...filtered, `${prefix}:${value}`]);
  };

  useEffect(() => updateTag("location", location), [location]);
  useEffect(() => updateTag("category", category), [category]);
  useEffect(() => updateTag("type", type), [type]);

  useEffect(() => {
    if (!open) {
      setName("");
      setType("__unset__");
      setLocation("__unset__");
      setCategory("__unset__");
      setFrequency("__unset__");
      setTags([]);
      setCondition("__unset__");
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (
      !name ||
      location === "__unset__" ||
      category === "__unset__" ||
      type === "__unset__" ||
      condition === "__unset__" ||
      frequency === "__unset__"
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "components"), {
        assetId,
        name,
        type,
        location,
        category,
        itemType: type,
        condition,
        tags,
        inspection: {
          frequency,
          lastChecked: null,
          nextDue: null,
          status: "pending",
        },
        createdAt: serverTimestamp(),
      });
      onSaved();
    } catch (err) {
      console.error("Error adding component:", err);
      setError("Failed to save the component. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Component</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <TextField
              value={error}
              disabled
              fullWidth
              variant="outlined"
              inputProps={{ style: { color: "red", fontWeight: "bold" } }}
            />
          )}

          <TextField
            label="Component Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            select
            label="Location"
            value={location}
            onChange={(e) => {
              const loc = e.target.value;
              setLocation(loc);
              setCategory("__unset__");
              setType("__unset__");
            }}
            fullWidth
            size="small"
          >
            <MenuItem value="__unset__" disabled>
              -- Select Location --
            </MenuItem>
            <MenuItem value="Exterior">Exterior</MenuItem>
            <MenuItem value="Interior">Interior</MenuItem>
          </TextField>

          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setType("__unset__");
            }}
            fullWidth
            size="small"
            disabled={location === "__unset__"}
          >
            <MenuItem value="__unset__" disabled>
              -- Select Category --
            </MenuItem>
            {categoryOptions.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Item Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            size="small"
            disabled={category === "__unset__"}
          >
            <MenuItem value="__unset__" disabled>
              -- Select Item Type --
            </MenuItem>
            {itemTypeOptions.map((it) => (
              <MenuItem key={it} value={it}>
                {it}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="__unset__" disabled>
              -- Select Condition --
            </MenuItem>
            {["Good", "Fair", "Poor"].map((cond) => (
              <MenuItem key={cond} value={cond}>
                {cond}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Inspection Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="__unset__" disabled>
              -- Select Frequency --
            </MenuItem>
            {["daily", "weekly", "monthly", "quarterly", "yearly"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            freeSolo
            options={[]} // Can prefill common tags later
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Add tags" size="small" />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;
