// src/components/Keys/KeySearchPanel.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const KeySearchPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [mode, setMode] = useState<"key" | "person" | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const handleSearch = async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    const isKeySearch = /^[A-F]?\d{1,2}$/.test(term); // B1, A12, 2, etc.
    setMode(isKeySearch ? "key" : "person");

    try {
      const snapshot = await getDocs(collection(db, "keyData"));
      const matchedResults: any[] = [];
      const matchedHistory: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const keyName = data?.keyName?.toLowerCase?.() ?? "";
        const holders = Array.isArray(data?.holders) ? data.holders : [];
        const historyEntries = Array.isArray(data?.history) ? data.history : [];

        // Key mode: match on key name
        if (isKeySearch && keyName === term) {
          matchedResults.push({
            keyName: data.keyName,
            holders,
          });
          matchedHistory.push(...historyEntries);
        }

        // Person mode: scan holders + history
        if (!isKeySearch) {
          const hasPersonInHolders = holders.some(
            (h: any) => h?.name?.toLowerCase?.() === term
          );
          const matchingHistory = historyEntries.filter(
            (h: any) => h?.name?.toLowerCase?.() === term
          );

          if (hasPersonInHolders) {
            matchedResults.push({
              keyName: data.keyName,
              holders: holders.filter(
                (h: any) => h?.name?.toLowerCase?.() === term
              ),
            });
          }

          if (matchingHistory.length > 0) {
            matchedHistory.push(...matchingHistory);
          }
        }
      });

      setResults(matchedResults);
      setHistory(
        matchedHistory.sort(
          (a, b) =>
            (b?.timestamp?.toMillis?.() ?? 0) -
            (a?.timestamp?.toMillis?.() ?? 0)
        )
      );
      setNoMatch(matchedResults.length === 0 && matchedHistory.length === 0);
    } catch (err) {
      console.error("Error during search:", err);
      setNoMatch(true);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Search Keys or People
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Search key or name"
          fullWidth
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (noMatch) setNoMatch(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {noMatch && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No matches found for "{searchTerm}".
        </Typography>
      )}

      {results.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {mode === "key" ? "Current Holders:" : "Assigned Keys:"}
          </Typography>
          <List>
            {results.map((res, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`Key: ${res.keyName}`}
                  secondary={
                    res.holders.length > 0
                      ? res.holders
                          .map((h: any) => `${h.name} @ ${h.location}`)
                          .join(", ")
                      : "No current holders"
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {history.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Activity History:
          </Typography>
          <Paper variant="outlined">
            <List dense>
              {history.map((entry, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${entry.action} — ${entry.keyName} — ${entry.name}`}
                    secondary={
                      entry.timestamp?.toDate
                        ? entry.timestamp.toDate().toLocaleString()
                        : "Unknown time"
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default KeySearchPanel;
