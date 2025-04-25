// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(43, 70, 53)", // your green
      contrastText: "rgb(206, 199, 188)", // cobblestone
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    allVariants: {
      color: "#2b4635", // Optional: darker green text
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiSelect: {
      defaultProps: {
        displayEmpty: true,
      },
    },
    MuiButton: {
      defaultProps: {
        size: "medium",
        variant: "contained",
        color: "primary",
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "1.25rem",
        },
      },
    },
  },
});

export default theme;
