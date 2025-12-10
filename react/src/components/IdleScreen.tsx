// source: Material UI components and styling - https://mui.com/
// source: Material UI icons - https://mui.com/material-ui/material-icons/

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

// props interface for idle screen (initial landing page)
// this screen allows player 1 to create a room or player 2 to join an existing room
interface IdleScreenProps {
  isConnected: boolean; // websocket connection status from server
  createRoom: () => void; // function to create a new game room (player 1)
  joinRoom: (code: string) => void; // function to join an existing game room with a code (player 2)
}

// idle screen component: initial landing page where players create or join rooms
// player 1 clicks "create new room" to get a unique room code
// player 2 enters that code in the text field and clicks "join room"
export function IdleScreen({ isConnected, createRoom, joinRoom }: IdleScreenProps) {
  // local state for room code input field
  // stores the 6-character code that player 2 types to join a room
  // automatically converted to uppercase for consistency with server-generated codes
  const [joinCode, setJoinCode] = useState<string>("");

  return (
    // full-screen container with gradient background
    // uses fixed positioning to cover entire viewport
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
      {/* centered white card containing all UI elements */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: 500,
          width: "100%",
          padding: 5,
          borderRadius: 6,
          textAlign: "center",
        }}
      >
        {/* circular gradient background with fork and knife icon */}
        {/* serves as the app logo/branding element */}
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

        {/* main title */}
        <Typography variant="h3" gutterBottom>
          Swipe & Dine
        </Typography>

        {/* subtitle explaining the app's purpose */}
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Find your perfect restaurant match
        </Typography>

        {/* connection status indicator with icon and text */}
        {/* shows green checkmark when connected, red wifi-off icon when disconnected */}
        {/* connection is required to create or join rooms */}
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

        {/* create new room button (for player 1) */}
        {/* disabled when not connected to server */}
        {/* on click, server generates unique 6-character room code */}
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

        {/* visual divider separating create and join sections */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
            OR JOIN EXISTING
          </Typography>
        </Divider>

        {/* room code input field (for player 2) */}
        {/* automatically converts input to uppercase for consistency with server-generated codes */}
        {/* accepts any text but typically expects 6-character alphanumeric code */}
        <TextField
          fullWidth
          placeholder="Enter room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
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

        {/* join room button (for player 2) */}
        {/* disabled when not connected OR when no room code is entered */}
        {/* on click, attempts to join room with the entered code */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => joinRoom(joinCode)}
          disabled={!isConnected || !joinCode}
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