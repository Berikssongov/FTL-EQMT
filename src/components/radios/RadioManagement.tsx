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
import AssignRadioModal from "./AssignRadioModal";
import RadioSearchModal from "./RadioSearchModal";
import { Radio } from "../../types";

const RadioManagement: React.FC = () => {
  const { role, superAdmin } = useRole();

  const canAssign = role === "manager" || role === "admin";
  const canCreate = role === "admin" && superAdmin;

  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [radios, setRadios] = useState<Radio[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);

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
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Radio Management
        </Typography>

        {canAssign && (
          <Button variant="contained" color="primary" onClick={() => setOpenAssign(true)}>
            Sign Out Radio
          </Button>
        )}

        <Button variant="outlined" onClick={() => setOpenSearch(true)}>
          Search Radios
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <RadioList
        radios={radios}
        onAssign={(radio) => setSelectedRadio(radio)}
      />

      {canAssign && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Managers and admins can assign radios to personnel.
        </Typography>
      )}

      {/* Modals */}

      <AssignRadioModal
        open={openAssign || !!selectedRadio}
        radios={radios}
        radio={selectedRadio}
        onClose={() => {
          setSelectedRadio(null);
          setOpenAssign(false);
        }}
        onUpdated={fetchRadios}
      />

      <RadioSearchModal
        open={openSearch}
        onClose={() => setOpenSearch(false)}
      />
    </Box>
  );
};

export default RadioManagement;