import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
} from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { format } from "date-fns";

interface Props {
  componentId: string;
  refreshTrigger?: string;
}

type LogEntry = {
  inspector: string;
  notes: string;
  status: string;
  date: { seconds: number };
};

const InspectionLogTable: React.FC<Props> = ({ componentId, refreshTrigger }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);

    console.log("🚀 Fetching inspection logs for component ID:", componentId);

    try {
      const ref = collection(db, "componentInspections");
      const q = query(ref, where("componentId", "==", componentId));

      console.log("📦 Firestore query executed:", q);

      const snap = await getDocs(q);
      console.log("📄 Logs fetched:", snap.docs.length, "documents found.");

      const list = snap.docs.map(doc => doc.data() as LogEntry);
      list.sort((a, b) => b.date.seconds - a.date.seconds);
      setLogs(list);
    } catch (err) {
      console.error("❌ Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [componentId, refreshTrigger]);

  return (
    <Paper sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Inspection History
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No inspection logs found.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Inspector</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>
                  {log.date?.seconds
                    ? format(new Date(log.date.seconds * 1000), "yyyy-MM-dd")
                    : "-"}
                </TableCell>
                <TableCell>{log.inspector}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>{log.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default InspectionLogTable;
