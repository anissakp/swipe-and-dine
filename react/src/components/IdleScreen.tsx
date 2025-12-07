import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface IdleScreenProps {
  isConnected: boolean;
  createRoom: () => void;
  joinRoom: (code: string) => void;
}

export function IdleScreen({ isConnected, createRoom, joinRoom }: IdleScreenProps) {
  // local state for the room code input field (used when joining a room)
  const [joinCode, setJoinCode] = useState("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #fef2f2 100%)",
        padding: 0,
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 650,
          width: "100%",
          padding: 5,
          borderRadius: 6,
          textAlign: "center",
        }}
      >
        {/* icon with fork and knife */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <RestaurantIcon sx={{ fontSize: 40, color: "white" }} />
        </Box>

        {/* title */}
        <Typography variant="h3" gutterBottom>
          Swipe & Dine
        </Typography>

        {/* subtitle */}
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Find your perfect restaurant match
        </Typography>

        {/* display current WebSocket connection status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 3,
          }}
        >
          {isConnected ? (
            <>
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
              <Typography variant="body2" color="success.main">
                Connected
              </Typography>
            </>
          ) : (
            <>
              <WifiOffIcon sx={{ color: "error.main", fontSize: 20 }} />
              <Typography variant="body2" color="error.main">
                Disconnected
              </Typography>
            </>
          )}
        </Box>

        {/* CHANGED: create new room button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={createRoom}
          disabled={!isConnected}
          sx={{
            mb: 3,
            py: 1.8,
            backgroundColor: "#b0b0b0",
            color: "white",
            textTransform: "none",
            fontSize: 16,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#909090",
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: "#d0d0d0",
              color: "#a0a0a0",
            },
          }}
        >
          Create New Room
        </Button>

        {/* divider between create and join sections */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
            OR JOIN EXISTING
          </Typography>
        </Divider>

        {/* CHANGED: join existing room section with input and button */}
        <TextField
          fullWidth
          placeholder="Enter room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())} // auto-uppercase room codes
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fafafa",
              borderRadius: "12px",
              "& fieldset": {
                borderColor: "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: "#d0d0d0",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2196F3",
              },
            },
            "& input": {
              padding: "14px 16px",
              textAlign: "center",
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => joinRoom(joinCode)}
          disabled={!isConnected || !joinCode} // disabled if not connected or no code entered
          sx={{
            textTransform: "none",
            fontSize: 16,
            py: 1.8,
            borderRadius: "8px",
            boxShadow: "none",
            "&.Mui-disabled": {
              backgroundColor: "#e8e8e8",
              color: "#b0b0b0",
            },
            "&:not(.Mui-disabled)": {
              backgroundColor: "#b0b0b0",
              color: "white",
              "&:hover": {
                backgroundColor: "#909090",
                boxShadow: "none",
              },
            },
          }}
        >
          Join Room
        </Button>
      </Paper>
    </Box>
  );
}