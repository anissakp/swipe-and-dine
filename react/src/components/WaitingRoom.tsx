import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

interface WaitingRoomProps {
  roomCode: string | null;
  playerCount: number;
}

export function WaitingRoom({ roomCode, playerCount }: WaitingRoomProps) {
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
        <Typography variant="h4" gutterBottom>
          Waiting Room
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          Share this code with your friend
        </Typography>

        {/* room code label */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Room Code
        </Typography>

        {/* room code display box */}
        <Box
          sx={{
            backgroundColor: "#fef3f0",
            borderRadius: "16px",
            padding: "16px 32px",
            display: "inline-block",
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight="600" letterSpacing={2}>
            {roomCode}
          </Typography>
        </Box>

        {/* player count with icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <PeopleIcon sx={{ color: "text.secondary", fontSize: 24 }} />
          <Typography variant="body1" color="text.secondary">
            {playerCount}/2 Players
          </Typography>
        </Box>

        {/* waiting message */}
        <Typography variant="body2" color="text.secondary">
          Waiting for another player to join...
        </Typography>
      </Paper>
    </Box>
  );
}