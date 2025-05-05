// src/components/Keys/KeySearchPanel.tsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import { KeyData, KeyLogEntry } from "../../types";

const KeySearchPanel: React.FC = () => {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedKeysByName, setMatchedKeysByName] = useState<KeyData[]>([]);
  const [matchedKeysByPerson, setMatchedKeysByPerson] = useState<KeyData[]>([]);
  const [historyLogs, setHistoryLogs] = useState<KeyLogEntry[]>([]);
  const [noResults, setNoResults] = useState(false);

  const performSearch = async () => {
    const trimmedQuery = queryText.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setNoResults(false);

    try {
      const keysSnap = await getDocs(collection(db, "keys"));
      const keys: KeyData[] = keysSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<KeyData, "id">),
      }));

      const matchedByKey = keys.filter(
        (k) =>
          k.keyName === trimmedQuery ||
          (k.isRestricted && k.currentHolder?.name === trimmedQuery)
      );
      setMatchedKeysByName(matchedByKey);

      const matchedByPerson = keys.filter((k) => {
        const inHolders =
          Array.isArray(k.holders) &&
          k.holders.some(
            (h) => h?.type === "person" && h.name === trimmedQuery
          );
        const inRestricted =
          k.isRestricted &&
          k.currentHolder?.type === "person" &&
          k.currentHolder?.name === trimmedQuery;

        return inHolders || inRestricted;
      });
      setMatchedKeysByPerson(matchedByPerson);

      const logsSnap = await getDocs(query(collection(db, "keyLogs")));
      const logs: KeyLogEntry[] = logsSnap.docs.map((doc) => doc.data() as KeyLogEntry);

      const matchedLogs = logs.filter(
        (log) =>
          log.person === trimmedQuery || log.keyName === trimmedQuery
      );

      setHistoryLogs(
        matchedLogs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );

      if (
        matchedByKey.length === 0 &&
        matchedByPerson.length === 0 &&
        matchedLogs.length === 0
      ) {
        setNoResults(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Keys or People
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Enter key or person's name"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") performSearch();
          }}
        />
        <Button variant="contained" onClick={performSearch}>
          Search
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {!loading && noResults && (
        <Typography color="textSecondary">No matches found.</Typography>
      )}

      {!loading && matchedKeysByName.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Key Holders:
          </Typography>
          {matchedKeysByName.map((key) => {
            const people =
              key.holders?.filter((h) => h.type === "person") || [];
            const lockboxes =
              key.holders?.filter((h) => h.type === "lockbox") || [];

            return (
              <Box key={key.id} sx={{ mb: 2 }}>
                <Typography fontWeight="bold">{key.keyName}</Typography>
                {key.isRestricted && key.currentHolder ? (
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    Held by: {key.currentHolder.name} ({key.currentHolder.type})
                  </Typography>
                ) : (
                  <>
                    {people.length > 0 && (
                      <Typography sx={{ whiteSpace: "pre-line" }}>
                        People:{"\n"}
                        {people
                          .map((h) => `${h.name} (x${h.quantity})`)
                          .join(",\n")}
                      </Typography>
                    )}
                    {lockboxes.length > 0 && (
                      <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
                        Lockboxes:{"\n"}
                        {lockboxes
                          .map((h) => `${h.name} (x${h.quantity})`)
                          .join(",\n")}
                      </Typography>
                    )}
                    {people.length === 0 && lockboxes.length === 0 && (
                      <Typography>No current holders.</Typography>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {!loading && matchedKeysByPerson.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Keys assigned to person:
          </Typography>
          {matchedKeysByPerson.map((key) => {
            const matchingHolder =
              key.holders?.find(
                (h) => h.type === "person" && h.name === queryText
              ) || key.currentHolder;

            return (
              <Box key={key.id} sx={{ mb: 1 }}>
                <Typography>
                  <strong>{key.keyName}</strong>:{" "}
                  {matchingHolder
                    ? `Quantity: ${matchingHolder.quantity || 1}`
                    : "Not found in holders"}
                </Typography>
              </Box>
            );
          })}
        </>
      )}

      {!loading && historyLogs.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            History:
          </Typography>
          {historyLogs.map((log, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">
                {log.timestamp}: {log.action} <strong>{log.keyName}</strong> —{" "}
                {log.action === "Signing Out"
                  ? `from ${log.lockbox} to ${log.person}`
                  : `from ${log.person} to ${log.lockbox}`}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </Paper>
  );
};

export default KeySearchPanel;
