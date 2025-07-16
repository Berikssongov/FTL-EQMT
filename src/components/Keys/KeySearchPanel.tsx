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
import { Timestamp } from "firebase/firestore";
import KeyTagEditorModal from "./KeyTagEditorModal";
import { useRole } from "../../contexts/RoleContext";

const KeySearchPanel: React.FC = () => {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedKeysByName, setMatchedKeysByName] = useState<KeyData[]>([]);
  const [matchedKeysByPerson, setMatchedKeysByPerson] = useState<KeyData[]>([]);
  const [matchedKeysByTag, setMatchedKeysByTag] = useState<KeyData[]>([]);
  const [historyLogs, setHistoryLogs] = useState<(KeyLogEntry & { formattedDate: string })[]>([]);
  const [selectedKeyForTagEdit, setSelectedKeyForTagEdit] = useState<KeyData | null>(null);
  const { superAdmin } = useRole();

  const performSearch = async (searchTerm?: string) => {
    const trimmedQuery = (searchTerm ?? queryText).trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setMatchedKeysByTag([]);
    setSelectedKeyForTagEdit(null);
    setQueryText(trimmedQuery); // Make sure queryText always matches what's being searched

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
          k.holders.some((h) => h?.type === "person" && h.name === trimmedQuery);
        const inRestricted =
          k.isRestricted &&
          k.currentHolder?.type === "person" &&
          k.currentHolder?.name === trimmedQuery;
        return inHolders || inRestricted;
      });
      setMatchedKeysByPerson(matchedByPerson);

      const matchedByTag = keys.filter(
        (k) =>
          Array.isArray(k.tags) &&
          k.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery.toLowerCase()))
      );
      setMatchedKeysByTag(matchedByTag);

      const logsSnap = await getDocs(query(collection(db, "keyLogs")));
      const rawLogs = logsSnap.docs.map((doc) => doc.data() as KeyLogEntry & { timestamp: unknown });
      const logsWithFormattedDate = rawLogs.map((log) => {
        let formattedDate = "Unknown Date";

        if (
          typeof log.timestamp === "object" &&
          log.timestamp !== null &&
          typeof (log.timestamp as Timestamp).toDate === "function"
        ) {
          formattedDate = (log.timestamp as Timestamp).toDate().toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } else if (typeof log.timestamp === "string") {
          const dt = new Date(log.timestamp);
          if (!isNaN(dt.getTime())) {
            formattedDate = dt.toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          }
        }

        return {
          ...log,
          formattedDate,
        };
      });

      const matchedLogs = logsWithFormattedDate.filter(
        (log) => log.person === trimmedQuery || log.keyName === trimmedQuery
      );
      matchedLogs.sort((a, b) => {
        const aTime = logTime(a.timestamp);
        const bTime = logTime(b.timestamp);
        return bTime - aTime;
      });
      setHistoryLogs(matchedLogs);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const logTime = (ts: Timestamp | string): number => {
    return ts instanceof Timestamp ? ts.toMillis() : new Date(ts).getTime();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Keys or People
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Enter key, person, or keyword"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") performSearch();
          }}
        />
        <Button variant="contained" onClick={() => performSearch()}>
          Search
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {!loading && matchedKeysByTag.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Keys matched by tag:
          </Typography>
          {matchedKeysByTag.map((key) => (
            <Box
              key={key.id}
              sx={{
                mb: 1,
                p: 1,
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => performSearch(key.keyName)}
            >
              <Typography>
                🔑 <strong>{key.keyName}</strong>
              </Typography>
              {key.tags && (
                <Typography variant="body2" color="textSecondary">
                  Tags: {key.tags.join(", ")}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {!loading && matchedKeysByName.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Key Holders:
          </Typography>
          {matchedKeysByName.map((key) => {
            const people = key.holders?.filter((h) => h.type === "person") || [];
            const lockboxes = key.holders?.filter((h) => h.type === "lockbox") || [];
            return (
              <Box key={key.id} sx={{ mb: 2 }}>
                <Typography
                  fontWeight="bold"
                  sx={{
                    cursor: superAdmin ? "pointer" : "default",
                    "&:hover": superAdmin ? { textDecoration: "underline" } : {},
                  }}
                  onClick={() => {
                    if (superAdmin && queryText.trim().toLowerCase() === key.keyName.toLowerCase()) {
                      setSelectedKeyForTagEdit(key);
                    }
                  }}
                >
                  {key.keyName}
                </Typography>
                {key.isRestricted && key.currentHolder ? (
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    Held by: {key.currentHolder.name} ({key.currentHolder.type})
                  </Typography>
                ) : (
                  <>
                    {people.length > 0 && (
                      <Typography sx={{ whiteSpace: "pre-line" }}>
                        People: {"\n"}
                        {people.map((h) => `${h.name} (x${h.quantity})`).join(",\n")}
                      </Typography>
                    )}
                    {lockboxes.length > 0 && (
                      <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
                        Lockboxes: {"\n"}
                        {lockboxes.map((h) => `${h.name} (x${h.quantity})`).join(",\n")}
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
              key.holders?.find((h) => h.type === "person" && h.name === queryText) ||
              key.currentHolder;
            return (
              <Box key={key.id} sx={{ mb: 1 }}>
                <Typography
                  fontWeight="bold"
                  sx={{
                    cursor: superAdmin ? "pointer" : "default",
                    "&:hover": superAdmin ? { textDecoration: "underline" } : {},
                  }}
                  onClick={() => {
                    if (superAdmin && queryText.trim().toLowerCase() === key.keyName.toLowerCase()) {
                      setSelectedKeyForTagEdit(key);
                    }
                  }}
                >
                  {key.keyName}
                </Typography>
                <Typography>
                  Quantity: {matchingHolder?.quantity || 1}
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
                {log.formattedDate}: {log.action} <strong>{log.keyName}</strong> —{" "}
                {log.action === "Signing Out"
                  ? `from ${log.lockbox} to ${log.person}`
                  : `from ${log.person} to ${log.lockbox}`}
              </Typography>
            </Box>
          ))}
        </>
      )}

      <KeyTagEditorModal
        open={!!selectedKeyForTagEdit}
        keyData={selectedKeyForTagEdit}
        onClose={() => {
          setSelectedKeyForTagEdit(null);
          performSearch();
        }}
      />
    </Paper>
  );
};

export default KeySearchPanel;
