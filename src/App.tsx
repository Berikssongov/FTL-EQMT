import React from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tabs,
  Tab,
} from "@mui/material";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import EquipmentList from "./components/EquipmentList";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const currentTab = location.pathname === "/equipment" ? "/equipment" : "/";

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: "rgb(43, 70, 53)", // dark green
          color: "rgb(206, 199, 188)", // cobblestone
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, color: "rgb(206, 199, 188)" }}
          >
            Manage your equipment efficiently
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "rgb(206, 199, 188)" }}
          >
            FTL Equipment Manager
          </Typography>
          <Box sx={{ width: 170 }} />
        </Toolbar>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          centered
          sx={{
            "& .MuiTab-root": { color: "rgb(206, 199, 188)" }, // tab text
            "& .Mui-selected": { fontWeight: 600 },
          }}
        >
          <Tab label="Dashboard" value="/" />
          <Tab label="Equipment List" value="/equipment" />
        </Tabs>
      </AppBar>
    </>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary">
        This is your future home for reports, metrics, and a snapshot of
        equipment activity.
      </Typography>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Header />

      <Box component="main" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/equipment"
            element={
              <Container maxWidth="lg">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Equipment Inventory
                </Typography>
                <EquipmentList />
              </Container>
            }
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
