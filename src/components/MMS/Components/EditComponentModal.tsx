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
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<ComponentData>) => void | Promise<void>;
  component: ComponentData;
}

type ComponentData = {
  id: string;
  assetId: string;
  name: string;
  type: string;
  location: string;
  category: string;
  condition: string;
  tags: string[];
  inspection: {
    frequency: string;
    lastChecked: string | null;
    nextDue: string | null;
    status: string;
    findings: string | string[]; // optional in case this modal doesn't manage it
  };
};

const EditComponentModal: React.FC<Props> = ({ open, onClose, onSave, component }) => {
  const [name, setName] = useState(component.name);
  const [type, setType] = useState(component.type);
  const [location, setLocation] = useState(component.location);
  const [category, setCategory] = useState(component.category);
  const [frequency, setFrequency] = useState(component.inspection.frequency);
  const [condition, setCondition] = useState(component.condition);
  const [tags, setTags] = useState<string[]>(component.tags || []);
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
    if (!value) return;
    const filtered = tags.filter(tag => !tag.startsWith(`${prefix}:`));
    setTags([...filtered, `${prefix}:${value}`]);
  };

  useEffect(() => updateTag("location", location), [location]);
  useEffect(() => updateTag("category", category), [category]);
  useEffect(() => updateTag("type", type), [type]);

  const handleSubmit = () => {
    if (!name || !location || !category || !type || !condition || !frequency) {
      setError("Please complete all required fields.");
      return;
    }

    onSave({
      name,
      type,
      location,
      category,
      condition,
      tags,
      inspection: {
        ...component.inspection,
        frequency,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Component</DialogTitle>
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
              setCategory("");
              setType("");
            }}
            fullWidth
            size="small"
          >
            <MenuItem value="" disabled>-- Select Location --</MenuItem>
            <MenuItem value="Exterior">Exterior</MenuItem>
            <MenuItem value="Interior">Interior</MenuItem>
          </TextField>

          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setType("");
            }}
            fullWidth
            size="small"
            disabled={!location}
          >
            <MenuItem value="" disabled>-- Select Category --</MenuItem>
            {categoryOptions.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Item Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            size="small"
            disabled={!category}
          >
            <MenuItem value="" disabled>-- Select Item Type --</MenuItem>
            {itemTypeOptions.map((it) => (
              <MenuItem key={it} value={it}>{it}</MenuItem>
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
            <MenuItem value="" disabled>-- Select Condition --</MenuItem>
            {["Good", "Fair", "Poor"].map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
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
            <MenuItem value="" disabled>-- Select Frequency --</MenuItem>
            {["daily", "weekly", "monthly", "quarterly", "yearly"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            freeSolo
            options={[]} // can add tag suggestions later
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Edit tags" size="small" />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditComponentModal;
