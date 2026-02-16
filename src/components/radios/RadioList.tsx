import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Typography,
  TableSortLabel,
  IconButton,
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Radio } from "../../types";

interface Props {
  radios: Radio[];
  onAssign: (radio: Radio) => void;
}

type Order = "asc" | "desc";
type OrderBy =
  | "callsign"
  | "radioNumber"
  | "serialNumber"
  | "status"
  | "assignedTo";

const RadioList: React.FC<Props> = ({ radios, onAssign }) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("callsign");

  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRadios = useMemo(() => {
    return [...radios].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (!aValue) aValue = "";
      if (!bValue) bValue = "";

      if (
        !isNaN(Number(aValue)) &&
        !isNaN(Number(bValue)) &&
        aValue !== "" &&
        bValue !== ""
      ) {
        return order === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [radios, order, orderBy]);

  if (radios.length === 0) {
    return <Typography color="text.secondary">No radios found.</Typography>;
  }

  const createSortLabel = (label: string, property: OrderBy) => (
    <TableSortLabel
      active={orderBy === property}
      direction={orderBy === property ? order : "asc"}
      onClick={() => handleSort(property)}
    >
      <strong>{label}</strong>
    </TableSortLabel>
  );

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {createSortLabel("Callsign", "callsign")}
            </TableCell>
            <TableCell>
              {createSortLabel("Radio #", "radioNumber")}
            </TableCell>
            <TableCell>
              {createSortLabel("Serial #", "serialNumber")}
            </TableCell>
            <TableCell>
              {createSortLabel("Status", "status")}
            </TableCell>
            <TableCell>
              {createSortLabel("Assigned To", "assignedTo")}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedRadios.map((radio) => (
            <TableRow key={radio.id}>
              <TableCell>{radio.callsign}</TableCell>
              <TableCell>{radio.radioNumber}</TableCell>
              <TableCell>{radio.serialNumber}</TableCell>
              <TableCell>{radio.status}</TableCell>
              <TableCell>{radio.assignedTo ?? "—"}</TableCell>
             <TableCell>
            <IconButton onClick={() => onAssign(radio)}>
              <AssignmentIndIcon />
            </IconButton>
          </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RadioList;