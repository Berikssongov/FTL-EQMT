import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Typography,
  Checkbox,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface Task {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  completed: boolean;
}

const TaskList: React.FC<{ listStyle?: boolean }> = ({ listStyle = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const snapshot = await getDocs(collection(db, "tasks"));
      const taskList: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">)
      }));
      setTasks(taskList);
    };

    fetchTasks();
  }, []);

  if (listStyle) {
    return (
      <List dense>
        {tasks.map((task) => (
          <ListItem key={task.id}>
            <Checkbox checked={task.completed} disableRipple />
            <ListItemText
              primary={task.title}
              secondary={`Created by ${task.createdBy}`}
            />
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <Grid container spacing={2}>
      {tasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id} {...({} as any)}>
          <Card>
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created by {task.createdBy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskList;
