import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "../../firebase";
import { useRole } from "../../contexts/RoleContext";
import CreateRadioModal from "./CreateRadioModal";
import RadioList from "./RadioList";
import { Radio } from "../../types";

const RadioManagement: React.FC = () => {
  const { role, superAdmin } = useRole();

  const canAssign = role === "manager" || role === "admin";
  const canCreate = role === "admin" && superAdmin;

  const [openCreate, setOpenCreate] = useState(false);
  const [radios, setRadios] = useState<Radio[]>([]);

  const fetchRadios = async () => {
    const ref = collection(db, "radios");
    const snapshot = await getDocs(query(ref, orderBy("callsign")));
    setRadios(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Radio, "id">),
      }))
    );
  };

  useEffect(() => {
    fetchRadios();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Radio Management
        </Typography>

        {canCreate && (
          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            Add Radio
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <RadioList radios={radios} />

      {canAssign && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Managers and admins can assign radios to personnel.
        </Typography>
      )}

      <CreateRadioModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={fetchRadios}
      />
    </Box>
  );
};

export default RadioManagement;