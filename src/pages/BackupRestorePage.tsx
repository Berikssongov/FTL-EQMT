/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { saveAs } from "file-saver";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { useRole } from "../contexts/RoleContext"; // Adjust path as needed

const firestore = getFirestore();

const collectionNames = [
  "assets",
  "assignedKeys",
  "components",
  "dashboardTiles",
  "equipment",
  "handTools",
  "keyLogs",
  "keys",
  "locations",
  "lockboxKeys",
  "partsRecords",
  "powerTools",
  "serviceRecords",
  "tasks",
  "users",
];

const BackupRestorePage = () => {
  const { loading, superAdmin } = useRole();
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingState, setLoadingState] = React.useState(false);

  const handleBackup = async () => {
    setLoadingState(true);
    const allCollections: Record<string, any[]> = {};

    try {
      for (const name of collectionNames) {
        const colRef = collection(firestore, name);
        const snapshot = await getDocs(colRef);
        allCollections[name] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      }

      const json = JSON.stringify(allCollections, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, `firebase-backup-${new Date().toISOString()}.json`);
    } catch (err: any) {
      console.error("Backup failed:", err);
      setError(`Backup failed: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setData(null);
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setData(json);
    } catch (err: any) {
      console.error("Failed to parse file:", err);
      setError("Invalid JSON file");
    }
  };

  const handleRestore = async () => {
    setError(null);
    if (!data) return;
    setLoadingState(true);

    try {
      for (const [collectionName, docs] of Object.entries(data)) {
        for (const docData of docs as any[]) {
          const { id, ...rest } = docData;
          const docRef = doc(firestore, collectionName, id);
          await setDoc(docRef, rest);
        }
      }
    } catch (err: any) {
      console.error("Restore failed:", err);
      setError(`Restore failed: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  const renderTree = (node: any, prefix = ""): React.ReactNode => {
    if (node === null || node === undefined) {
      return <TreeItem key={`${prefix}-null`} itemId={`${prefix}-null`} label="null" />;
    }
    if (typeof node !== "object") {
      return <TreeItem key={`${prefix}-leaf`} itemId={`${prefix}-leaf`} label={String(node)} />;
    }
    if (Array.isArray(node)) {
      return (
        <TreeItem key={`${prefix}-array`} itemId={`${prefix}-array`} label={`Array[${node.length}]`}>
          {node.map((item, idx) => renderTree(item, `${prefix}-idx${idx}`))}
        </TreeItem>
      );
    }
    return (
      <TreeItem key={`${prefix}-obj`} itemId={`${prefix}-obj`} label={`Object`}>
        {Object.entries(node).map(([key, val]) => (
          <TreeItem key={`${prefix}-${key}`} itemId={`${prefix}-${key}`} label={key}>
            {renderTree(val, `${prefix}-${key}`)}
          </TreeItem>
        ))}
      </TreeItem>
    );
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography>Loading user info...</Typography>
      </Box>
    );
  }

  if (!superAdmin) {
    return (
      <Box p={4}>
        <Typography variant="h5">🔐 Protected Page</Typography>
        <Typography>You are not authorized to access this page.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Backup & Restore Firebase
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" onClick={handleBackup} disabled={loadingState}>
          {loadingState ? <CircularProgress size={20} /> : "Download Backup"}
        </Button>

        <Button component="label" variant="outlined" disabled={loadingState}>
          Upload JSON
          <input type="file" accept=".json" hidden onChange={handleUpload} />
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleRestore}
          disabled={!data || loadingState}
        >
          {loadingState ? <CircularProgress size={20} /> : "Restore to Firebase"}
        </Button>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: "#fdecea" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {data && (
        <Paper sx={{ p: 2, maxHeight: 500, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Simulated Firestore Tree View
          </Typography>
          <SimpleTreeView aria-label="uploaded-tree">
            <TreeItem key="root" itemId="root" label="root">
              {Object.entries(data).map(([collectionName, docs]) => (
                <TreeItem
                  key={`col-${collectionName}`}
                  itemId={`col-${collectionName}`}
                  label={collectionName}
                >
                  {(docs as any[]).map((docItem: any) => (
                    <TreeItem
                      key={`doc-${collectionName}-${docItem.id}`}
                      itemId={`doc-${collectionName}-${docItem.id}`}
                      label={docItem.id}
                    >
                      {renderTree(docItem, `doc-${collectionName}-${docItem.id}`)}
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
          </SimpleTreeView>
        </Paper>
      )}
    </Box>
  );
};

export default BackupRestorePage;
