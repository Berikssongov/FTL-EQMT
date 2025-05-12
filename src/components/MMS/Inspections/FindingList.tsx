import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Chip, Divider } from "@mui/material";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { format } from "date-fns";

type Finding = {
  id: string;
  date: string;
  finding: string;
  cause: string;
  impact: number;
  inspectorName: string;
  actionItem: string;
  status: string;
};

type Props = {
  componentId: string;
  refreshKey?: number;
};

const FindingList: React.FC<Props> = ({ componentId, refreshKey }) => {
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const q = query(
          collection(db, "findings"),
          where("componentId", "==", componentId)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Finding[];

        setFindings(fetched);
      } catch (err) {
        console.error("Error fetching findings:", err);
      }
    };

    fetchFindings();
  }, [componentId, refreshKey]);

  return (
    <Box>
      {findings.length === 0 ? (
        <Typography variant="body2">No findings reported.</Typography>
      ) : (
        findings.map((f) => (
          <Paper key={f.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {f.finding}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cause: {f.cause}
            </Typography>
            <Typography variant="body2">Impact: {f.impact}</Typography>
            <Typography variant="body2">Status: {f.status}</Typography>
            <Typography variant="body2">
              Inspector: {f.inspectorName}
            </Typography>
            <Typography variant="body2">
              Date: {f.date}
            </Typography>
            {f.actionItem && (
              <Typography variant="body2">
                Action Item: {f.actionItem}
              </Typography>
            )}
            <Divider sx={{ mt: 2 }} />
          </Paper>
        ))
      )}
    </Box>
  );
};

export default FindingList;
