// src/components/Keys/KeyFormPanel.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
} from "@mui/material";

interface KeyForm {
  keyName: string;
  signInOut: string;
  person: string;
  lockboxLocation: string;
  otherLocation?: string;
}

const KeyFormPanel: React.FC = () => {
  const [form, setForm] = useState<KeyForm>({
    keyName: "",
    signInOut: "Signing In",
    person: "",
    lockboxLocation: "",
    otherLocation: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name!]: value }));

    if (name === "lockboxLocation" && value !== "Other") {
      setForm((prev) => ({ ...prev, otherLocation: "" }));
    }
  };

  const handleSubmit = () => {
    const location =
      form.lockboxLocation === "Other" ? form.otherLocation : form.lockboxLocation;

    const keyData = {
      ...form,
      lockboxLocation: location,
    };

    // TODO: Add Firebase logic or API call here
    console.log("Submitting Key Form:", keyData);

    // Reset form (optional)
    setForm({
      keyName: "",
      signInOut: "Signing In",
      person: "",
      lockboxLocation: "",
      otherLocation: "",
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Key Assignment Form
      </Typography>

      <Grid container spacing={2} {...({} as any)}>
        <Grid item xs={12} md={6} {...({} as any)}>
          <TextField
            label="Key Name"
            name="keyName"
            value={form.keyName}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6} {...({} as any)}>
          <FormControl fullWidth>
            <InputLabel>Sign In/Out</InputLabel>
            <Select
              name="signInOut"
              value={form.signInOut}
              label="Sign In/Out"
              onChange={handleSelectChange}
            >
              <MenuItem value="Signing In">Signing In</MenuItem>
              <MenuItem value="Signing Out">Signing Out</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6} {...({} as any)}>
          <TextField
            label="Person"
            name="person"
            value={form.person}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6} {...({} as any)}>
          <FormControl fullWidth>
            <InputLabel>Lockbox Location</InputLabel>
            <Select
              name="lockboxLocation"
              value={form.lockboxLocation}
              label="Lockbox Location"
              onChange={handleSelectChange}
            >
              <MenuItem value="Maintenance Box">Maintenance Box</MenuItem>
              <MenuItem value="Operations Box">Operations Box</MenuItem>
              <MenuItem value="Visitor Centre Box">Visitor Centre Box</MenuItem>
              <MenuItem value="Artifacts Box">Artifacts Box</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {form.lockboxLocation === "Other" && (
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Other Location"
              name="otherLocation"
              value={form.otherLocation}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        )}

        <Grid item xs={12} {...({} as any)}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default KeyFormPanel;
