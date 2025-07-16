// src/components/Keys/KeyTagEditorModal.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Chip,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { KeyData } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  keyData: KeyData | null;
}

const KeyTagEditorModal: React.FC<Props> = ({ open, onClose, keyData }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (keyData) {
      setTags(keyData.tags || []);
    }
  }, [keyData]);

  const handleSave = async () => {
    if (!keyData) return;
    setSaving(true);
    try {
      const docRef = doc(db, "keys", keyData.id);
      await updateDoc(docRef, { tags });
      onClose();
    } catch (error) {
      console.error("Error saving tags:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Tags for Key: {keyData?.keyName || ""}
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          value={tags}
          onChange={(e, newValue) => setTags(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Add tag" />
          )}
          options={[]}
        />
        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !keyData?.id}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default KeyTagEditorModal;