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
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../contexts/RoleContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  assetId: string;
}

const AddComponentModal: React.FC<Props> = ({ open, onClose, onSaved, assetId }) => {
  const { role, loading: roleLoading } = useRole();

  const [name, setName] = useState("");
  const [type, setType] = useState("__unset__");
  const [location, setLocation] = useState("__unset__");
  const [category, setCategory] = useState("__unset__");
  const [frequency, setFrequency] = useState("__unset__");
  const [tags, setTags] = useState<string[]>([]);
  const [condition, setCondition] = useState("__unset__");
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("__unset__");
  const [newRoomName, setNewRoomName] = useState("");

  const frequencyOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi-annually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "5-years", label: "Every 5 Years" },
  ];


  const exteriorCategories = ["Weather Envelope", "Structure", "Landscaping", "Grounds", "Other"];
  const interiorCategories = ["Electrical", "HVAC", "Plumbing", "Fire Systems", "Life Safety", "Finishes", "Millwork", "Other"];

  const typeMap: Record<string, string[]> = {
    "Weather Envelope": ["Roofing", "Siding", "Gutters", "Flashing", "Fenestration"],
    Structure: ["Decks", "Foundation", "Stairs", "Ramp"],
    Landscaping: ["Sub-Surface Drainage", "Shrubs", "Plant Beds", "Asphalt", "Concrete", "Curbing"],
    Grounds: ["Parking Lot Lines", "Light Posts", "Gates"],
    Electrical: ["Lights", "Outlets", "Displays/Signs", "Door Opener", "Alarm System", "Appliance"],
    HVAC: ["Heater", "AC Unit", "Vent/Fan"],
    Plumbing: ["Fixtures", "Water Cooler", "Washing Machine", "Floor Drain"],
    "Fire Systems": ["Pull Station", "Emergency Lighting", "Fire Suppression"],
    "Life Safety": ["First Aid Kit", "AED"],
    Finishes: ["Ceilings, Walls, Floors"],
    Millwork: ["Doors, Baseboard, Casings", "Cabinet"],
    Other: ["Exterior Outlets", "Lighting", "Electrical Devices", "Spigot"],
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
      setRooms([]);
      setSelectedRoom("__unset__");
      setNewRoomName("");
    }
  }, [open]);

  useEffect(() => {
    if (location === "Interior" && assetId) {
      const fetchRooms = async () => {
        try {
          const snapshot = await getDocs(collection(db, `assets/${assetId}/rooms`));
          const roomNames = snapshot.docs.map(doc => doc.data().name).filter(Boolean);
          setRooms(roomNames);
        } catch (err) {
          console.error("Failed to fetch rooms:", err);
          setRooms([]);
        }
      };
      fetchRooms();
    }
  }, [location, assetId]);

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const id = newRoomName.trim().toLowerCase().replace(/\s+/g, "-");
      await setDoc(doc(db, `assets/${assetId}/rooms`, id), {
        name: newRoomName.trim(),
        createdAt: serverTimestamp(),
      });
      setRooms((prev) => [...prev, newRoomName.trim()]);
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to add room:", err);
    }
  };

  const handleSubmit = async () => {
    if (
      !name ||
      location === "__unset__" ||
      category === "__unset__" ||
      type === "__unset__" ||
      condition === "__unset__" ||
      frequency === "__unset__" ||
      (location === "Interior" && rooms.length > 0 && selectedRoom === "__unset__")
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
        frequency, // ✅ put frequency at the top level
        room: location === "Interior" && selectedRoom !== "__unset__" ? selectedRoom : null,
        inspection: {
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
        {roleLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : role !== "admin" ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="error">
              You do not have permission to add components. Only admins can do that.
            </Typography>
          </Box>
        ) : (
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
                setSelectedRoom("__unset__");
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="__unset__" disabled>-- Select Location --</MenuItem>
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
              <MenuItem value="__unset__" disabled>-- Select Category --</MenuItem>
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
              disabled={category === "__unset__"}
            >
              <MenuItem value="__unset__" disabled>-- Select Item Type --</MenuItem>
              {itemTypeOptions.map((it) => (
                <MenuItem key={it} value={it}>{it}</MenuItem>
              ))}
            </TextField>

            {location === "Interior" && rooms.length > 0 && (
              <TextField
                select
                label="Room"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="__unset__" disabled>-- Select Room --</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room} value={room}>{room}</MenuItem>
                ))}
              </TextField>
            )}

            {location === "Interior" && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Add New Room"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  size="small"
                  fullWidth
                />
                <Button onClick={handleAddRoom} variant="outlined">
                  Add Room
                </Button>
              </Stack>
            )}

            <TextField
              select
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="__unset__" disabled>-- Select Condition --</MenuItem>
              {["Good", "Fair", "Poor"].map((cond) => (
                <MenuItem key={cond} value={cond}>{cond}</MenuItem>
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
  <MenuItem value="__unset__" disabled>-- Select Frequency --</MenuItem>
  {frequencyOptions.map((opt) => (
    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
  ))}
</TextField>

            <Autocomplete
              multiple
              freeSolo
              options={[]} // Add suggestions later
              value={tags}
              onChange={(_, newValue) => setTags(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const props = getTagProps({ index });
                  return <Chip {...props} key={`add-component-tag-${option}-${index}`} label={option} />;
                })
                
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags" size="small" />
              )}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={role !== "admin"}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;
