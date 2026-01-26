import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Typography,
} from "@mui/material";
import { Radio } from "../../types";

interface Props {
  radios: Radio[];
}

const RadioList: React.FC<Props> = ({ radios }) => {
  if (radios.length === 0) {
    return <Typography color="text.secondary">No radios found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Callsign</strong></TableCell>
            <TableCell><strong>Radio #</strong></TableCell>
            <TableCell><strong>Serial #</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Assigned To</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {radios.map((radio) => (
            <TableRow key={radio.id}>
              <TableCell>{radio.callsign}</TableCell>
              <TableCell>{radio.radioNumber}</TableCell>
              <TableCell>{radio.serialNumber}</TableCell>
              <TableCell>{radio.status}</TableCell>
              <TableCell>{radio.assignedTo ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RadioList;