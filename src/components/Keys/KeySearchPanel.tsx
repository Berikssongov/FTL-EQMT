import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Divider,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { AssignedKey, LockboxKey, KeyLogEntry } from "../../types";

const KeySearchPanel: React.FC = () => {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedMatches, setAssignedMatches] = useState<AssignedKey[]>([]);
  const [lockboxMatches, setLockboxMatches] = useState<LockboxKey[]>([]);
  const [history, setHistory] = useState<KeyLogEntry[]>([]);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setAssignedMatches([]);
    setLockboxMatches([]);
    setHistory([]);
    setNoResults(false);

    const queryLower = queryText.trim().toLowerCase();

    if (!queryLower) {
      setLoading(false);
      setNoResults(true);
      return;
    }

    try {
      const assignedSnap = await getDocs(collection(db, "assignedKeys"));
      const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));
      const logsSnap = await getDocs(collection(db, "keyLogs"));

      const allAssigned = assignedSnap.docs.map(doc => doc.data() as AssignedKey);
      const allLockbox = lockboxSnap.docs.map(doc => doc.data() as LockboxKey);
      const allLogs = logsSnap.docs.map(doc => doc.data() as KeyLogEntry);

      const matchesAssigned = allAssigned.filter(
        (a) =>
          a.person.toLowerCase().includes(queryLower) ||
          a.keyName.toLowerCase() === queryLower
      );

      const matchesLockbox = allLockbox.filter(
        (l) =>
          l.lockbox.toLowerCase().includes(queryLower) ||
          l.keyName.toLowerCase() === queryLower
      );

      const matchingLogs = allLogs.filter(
        (log) =>
          log.keyName.toLowerCase() === queryLower ||
          log.person.toLowerCase().includes(queryLower)
      );

      setAssignedMatches(matchesAssigned);
      setLockboxMatches(matchesLockbox);
      setHistory(matchingLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      if (
        matchesAssigned.length === 0 &&
        matchesLockbox.length === 0 &&
        matchingLogs.length === 0
      ) {
        setNoResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Search Keys or People
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Enter a key or name"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {noResults && <Typography>No matches found for "{queryText}"</Typography>}

      {assignedMatches.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">Keys Assigned to People</Typography>
          <List>
            {assignedMatches.map((a, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`Key: ${a.keyName}`}
                  secondary={`Person: ${a.person}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {lockboxMatches.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">Keys in Lockboxes</Typography>
          <List>
            {lockboxMatches.map((l, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`Key: ${l.keyName}`}
                  secondary={`Lockbox: ${l.lockbox} — Quantity: ${l.quantity}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {history.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6">History</Typography>
          <List>
            {history.map((entry, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`${entry.action}: ${entry.keyName}`}
                  secondary={`From: ${entry.lockbox} — To: ${entry.person} @ ${new Date(
                    entry.timestamp
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default KeySearchPanel;
