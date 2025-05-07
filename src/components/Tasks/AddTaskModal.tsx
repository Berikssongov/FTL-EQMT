// src/components/Tasks/AddTaskModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const AddTaskModal: React.FC<Props> = ({ open, onClose, onAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;

    await addDoc(collection(db, "tasks"), {
      title,
      description,
      status: "pending",
      createdAt: serverTimestamp(),
      createdBy: "admin", // Update this later with actual user if auth is added
    });

    setTitle("");
    setDescription("");
    onClose();
    onAdded();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          multiline
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskModal;
