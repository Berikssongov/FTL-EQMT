import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Grid,
  Alert,
} from "@mui/material";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRole } from "../../contexts/RoleContext"; // ✅ NEW

interface RestrictedKey {
  id: string;
  keyName: string;
  isRestricted: true;
  currentHolder: {
    type: "lockbox" | "person";
    name: string;
  };
}

interface NonRestrictedKey {
  id: string;
  keyName: string;
  isRestricted: false;
  holders: {
    type: "lockbox" | "person";
    name: string;
    quantity: number;
  }[];
}

type KeyData = RestrictedKey | NonRestrictedKey;

const KeyFormPanel: React.FC = () => {
  const { role } = useRole(); // ✅ NEW

  if (role !== "manager" && role !== "admin") return null; // ✅ Hide if not allowed

  const [keys, setKeys] = useState<KeyData[]>([]);
  const [keyName, setKeyName] = useState("");
  const [action, setAction] = useState("Signing Out");
  const [person, setPerson] = useState("");
  const [lockboxLocation, setLockboxLocation] = useState("");
  const [otherLockbox, setOtherLockbox] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchKeys = async () => {
      const snap = await getDocs(collection(db, "keys"));
      const fetched = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data()),
      }));
      setKeys(fetched as KeyData[]);
    };
    fetchKeys();
  }, []);

  const isRestricted = /^[A-Fa-f]\d{1,2}$/.test(keyName.trim());
  const finalLockbox = lockboxLocation === "Other" ? otherLockbox.trim() : lockboxLocation;
  const matchingKey = keys.find(
    (k) => k.keyName.trim().toLowerCase() === keyName.trim().toLowerCase()
  );

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!keyName || !person || !finalLockbox) {
      setError("Please complete all fields.");
      return;
    }

    const isBypass = person.trim().toLowerCase() === "created" && role === "admin"; // ✅ NEW: Admin-only bypass

    if (!matchingKey) {
      const newData = isRestricted
        ? {
            keyName: keyName.trim(),
            isRestricted: true,
            currentHolder:
              action === "Signing Out"
                ? { type: "person", name: person.trim() }
                : { type: "lockbox", name: finalLockbox },
          }
        : {
            keyName: keyName.trim(),
            isRestricted: false,
            holders: [
              {
                type: action === "Signing Out" ? "person" : "lockbox",
                name: action === "Signing Out" ? person.trim() : finalLockbox,
                quantity: 1,
              },
            ],
          };

      await setDoc(doc(collection(db, "keys")), newData);
    } else if (matchingKey.isRestricted) {
      const keyRef = doc(db, "keys", matchingKey.id);
      const current = matchingKey.currentHolder;

      if (action === "Signing Out") {
        if (!isBypass && current.type !== "lockbox") {
          setError(`This key is not in a lockbox and cannot be signed out.`);
          return;
        }

        await updateDoc(keyRef, {
          currentHolder: { type: "person", name: person.trim() },
        });
      } else {
        if (
          !isBypass &&
          (current.type !== "person" ||
            current.name.trim().toLowerCase() !== person.trim().toLowerCase())
        ) {
          setError(
            `This key is not signed out to ${person}. It's with ${current.name}.`
          );
          return;
        }

        await updateDoc(keyRef, {
          currentHolder: { type: "lockbox", name: finalLockbox },
        });
      }
    } else {
      const keyRef = doc(db, "keys", matchingKey.id);
      const holders = [...matchingKey.holders];
      const type = action === "Signing Out" ? "person" : "lockbox";
      const name = type === "person" ? person.trim() : finalLockbox;

      const existing = holders.find(
        (h) => h.type === type && h.name.trim().toLowerCase() === name.toLowerCase()
      );

      if (action === "Signing Out") {
        const from = holders.find(
          (h) =>
            h.type === "lockbox" &&
            h.name.trim().toLowerCase() === finalLockbox.toLowerCase()
        );

        if (!from || from.quantity < 1) {
          setError(`No "${keyName}" key available at ${finalLockbox}`);
          return;
        }

        from.quantity -= 1;
        if (from.quantity === 0) {
          holders.splice(holders.indexOf(from), 1);
        }

        if (existing) existing.quantity += 1;
        else holders.push({ type: "person", name, quantity: 1 });
      } else {
        const from = holders.find(
          (h) =>
            h.type === "person" &&
            h.name.trim().toLowerCase() === person.trim().toLowerCase()
        );

        if (!from || from.quantity < 1) {
          setError(`${person} does not have any "${keyName}" keys.`);
          return;
        }

        from.quantity -= 1;
        if (from.quantity === 0) {
          holders.splice(holders.indexOf(from), 1);
        }

        if (existing) existing.quantity += 1;
        else holders.push({ type: "lockbox", name, quantity: 1 });
      }

      await updateDoc(keyRef, { holders });
    }

    await addDoc(collection(db, "keyLogs"), {
      keyName: keyName.trim(),
      action,
      person: person.trim(),
      lockbox: finalLockbox,
      timestamp: new Date().toISOString(),
    });

    setSuccess(`Key "${keyName}" successfully ${action}.`);
    setKeyName("");
    setPerson("");
    setLockboxLocation("");
    setOtherLockbox("");
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        🔐 Key Sign In/Out Form
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6} {...({} as any)}>
          <TextField
            label="Key Name"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6} {...({} as any)}>
          <FormControl fullWidth>
            <InputLabel>Action</InputLabel>
            <Select value={action} onChange={(e) => setAction(e.target.value)} label="Action">
              <MenuItem value="Signing Out">Signing Out</MenuItem>
              <MenuItem value="Signing In">Signing In</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} {...({} as any)}>
          <TextField
            label="Person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6} {...({} as any)}>
          <FormControl fullWidth>
            <InputLabel>Lockbox Location</InputLabel>
            <Select
              value={lockboxLocation}
              onChange={(e) => setLockboxLocation(e.target.value)}
              label="Lockbox Location"
            >
              <MenuItem value="Maintenance Box">Maintenance Box</MenuItem>
              <MenuItem value="Operations Box">Operations Box</MenuItem>
              <MenuItem value="Artifacts Box">Artifacts Box</MenuItem>
              <MenuItem value="Visitor Centre Box">Visitor Centre Box</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {lockboxLocation === "Other" && (
          <Grid item xs={12} {...({} as any)}>
            <TextField
              label="Custom Lockbox Name"
              value={otherLockbox}
              onChange={(e) => setOtherLockbox(e.target.value)}
              fullWidth
            />
          </Grid>
        )}
        <Grid item xs={12} {...({} as any)}>
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default KeyFormPanel;
