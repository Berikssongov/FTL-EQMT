import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ReplacementPart {
  part: string;
  addedAt: any;
}

interface RadioHistoryEntry {
  id: string;
  radioId: string;
  radioCallsign: string;
  radioNumber: string;
  serialNumber: string;
  personName: string;
  assignedAt: any;
  returnedAt: any;
  accessories: string[];
  replacementParts?: ReplacementPart[];
}

const replacementOptions = ["Antenna", "Battery", "Belt Clip"];

const RadioSearchModal: React.FC<Props> = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<RadioHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<{ [key: string]: string[] }>({});

  // =========================
  // Search handler
  // =========================
  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "radioAssignments"));
      const data: RadioHistoryEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<RadioHistoryEntry, "id">),
      }));

      const term = search.toLowerCase();

      const filtered = data.filter((entry) => {
        const person = entry.personName?.toLowerCase() ?? "";
        const callsign = entry.radioCallsign?.toLowerCase() ?? "";
        const serial = entry.serialNumber?.toLowerCase() ?? "";
        const radioNum = entry.radioNumber?.toLowerCase() ?? "";

        return (
          person.includes(term) ||
          callsign.includes(term) ||
          serial.includes(term) ||
          radioNum.includes(term)
        );
      });

      setResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // =========================
  // Toggle checkbox selection
  // =========================
  const toggleReplacement = (entryId: string, part: string) => {
    setSelectedReplacement((prev) => {
      const current = prev[entryId] || [];
      const exists = current.includes(part);
      const updated = exists ? current.filter((p) => p !== part) : [...current, part];
      return { ...prev, [entryId]: updated };
    });
  };

  // =========================
  // Save replacement parts
  // =========================
  const saveReplacement = async (entry: RadioHistoryEntry) => {
    const parts = selectedReplacement[entry.id] || [];
    if (parts.length === 0) return;

    try {
      const entryRef = doc(db, "radioAssignments", entry.id);

      // Merge new parts with existing ones
      const updatedParts: ReplacementPart[] = [
        ...(entry.replacementParts || []),
        ...parts.map((p) => ({ part: p, addedAt: Timestamp.now() })),
      ];

      await updateDoc(entryRef, {
        replacementParts: updatedParts,
        updatedAt: Timestamp.now(),
      });

      alert(`Saved replacement parts for ${entry.radioCallsign}`);

      // Update local state
      setResults((prev) =>
        prev.map((r) =>
          r.id === entry.id ? { ...r, replacementParts: updatedParts } : r
        )
      );

      setSelectedReplacement((prev) => ({ ...prev, [entry.id]: [] }));
    } catch (err) {
      console.error("Failed to save replacement parts:", err);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Search Radio History</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Search by Name, Callsign, Serial #, or Radio #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            Search
          </Button>

          {results.length === 0 && !loading && (
            <Typography color="text.secondary" mt={2}>
              No results
            </Typography>
          )}

          {results.map((entry) => (
            <Box
              key={entry.id}
              sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1, mt: 1 }}
            >
              <Typography>
                <strong>Callsign:</strong> {entry.radioCallsign} | <strong>Radio #:</strong>{" "}
                {entry.radioNumber} | <strong>Serial #:</strong> {entry.serialNumber}
              </Typography>
              <Typography>
                <strong>Person:</strong> {entry.personName} | <strong>Assigned At:</strong>{" "}
                {entry.assignedAt?.toDate?.().toLocaleString() ?? "—"} |{" "}
                <strong>Returned At:</strong> {entry.returnedAt?.toDate?.().toLocaleString() ?? "—"}
              </Typography>
              <Typography>
                <strong>Accessories:</strong> {entry.accessories.join(", ") || "—"}
              </Typography>

              {/* Replacement parts */}
              <Box mt={1}>
                <Typography><strong>Replacement Parts:</strong></Typography>
                <Stack direction="column" spacing={0.5}>
                  {entry.replacementParts?.map((r, i) => (
                    <Typography key={i}>
                      {r.part} (added {r.addedAt?.toDate?.().toLocaleString()})
                    </Typography>
                  ))}
                </Stack>
              </Box>

              {/* Add new replacement parts */}
              <Stack direction="row" spacing={1} mt={1} alignItems="center">
                {replacementOptions.map((part) => (
                  <FormControlLabel
                    key={part}
                    control={
                      <Checkbox
                        checked={selectedReplacement[entry.id]?.includes(part) || false}
                        onChange={() => toggleReplacement(entry.id, part)}
                      />
                    }
                    label={part}
                  />
                ))}
                <Button
                  onClick={() => saveReplacement(entry)}
                  size="small"
                  variant="outlined"
                >
                  Save
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RadioSearchModal;