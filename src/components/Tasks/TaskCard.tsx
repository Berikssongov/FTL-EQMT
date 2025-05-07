// src/components/Tasks/TaskCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  createdAt: any;
  createdBy: string;
}

interface Props {
  task: Task;
  onToggleStatus: (id: string, status: "pending" | "completed") => void;
}

const TaskCard: React.FC<Props> = ({ task, onToggleStatus }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" sx={{ textDecoration: task.status === "completed" ? "line-through" : "none" }}>
            {task.title}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={task.status === "completed"}
                onChange={() => onToggleStatus(task.id, task.status)}
              />
            }
            label="Done"
          />
        </Box>
        {task.description && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {task.description}
          </Typography>
        )}
        <Typography variant="caption" color="textSecondary">
          Created by {task.createdBy || "Unknown"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
