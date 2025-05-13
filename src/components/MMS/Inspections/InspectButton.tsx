// src/components/Inspections/InspectButton.tsx

import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import InspectionWizard from "./InspectionWizard";

type Props = {
  assetId: string;
};

const InspectButton: React.FC<Props> = ({ assetId }) => {
  const [dueComponents, setDueComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchDueComponents = async () => {
      try {
        // 1. Get components under this asset
        const compSnap = await getDocs(
          query(collection(db, "components"), where("assetId", "==", assetId))
        );
        const componentIds = compSnap.docs.map((doc) => doc.id);

        // 2. Find routineMaintenance entries where componentId is in that list and nextDue is in the past
        const rmSnap = await getDocs(collection(db, "routineMaintenance"));
        const due = rmSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (entry: any) =>
              componentIds.includes(entry.componentId) &&
              entry.nextDue.toDate() <= new Date()
          )
          .map((entry: any) => entry.componentId);

        setDueComponents(due);
      } catch (err) {
        console.error("Error checking for due components:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDueComponents();
  }, [assetId]);

  if (loading) return <CircularProgress size={20} />;

  if (dueComponents.length === 0) return null;

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Inspect
      </Button>
      {open && (
        <InspectionWizard
          open={open}
          onClose={() => setOpen(false)}
          componentIds={dueComponents}
        />
      )}
    </>
  );
};

export default InspectButton;
