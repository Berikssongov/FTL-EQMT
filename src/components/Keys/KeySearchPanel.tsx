// src/components/Keys/KeySearchPanel.tsx

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
} from "@mui/material";

const KeySearchPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = () => {
    // TODO: Hook to Firebase backend
    console.log("Searching for:", query);
    setResults([
      `Found key record for "${query}"`,
      "Signed Out: Jan 2, 2024 to John Doe",
      "Signed In: Jan 5, 2024 to Maintenance Box",
    ]);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Search Keys / People
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          label="Search Key or Person"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      {results.length > 0 && (
        <Box>
          <Divider sx={{ mb: 1 }} />
          <List dense>
            {results.map((item, idx) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default KeySearchPanel;
