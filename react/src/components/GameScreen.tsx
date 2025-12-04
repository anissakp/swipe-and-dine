import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, LinearProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckIcon from "@mui/icons-material/Check";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Restaurant, Choice } from "../shared/types";
import PeopleIcon from "@mui/icons-material/People";

interface GameScreenProps {
  currentCard: Restaurant | null;
  cardIndex: number;
  totalCards: number;
  roundNumber: number;
  isWaiting: boolean;
  makeChoice: (restaurantId: string, choice: Choice) => void;
}

export function GameScreen({
  currentCard,
  cardIndex,
  totalCards,
  roundNumber,
  isWaiting,
  makeChoice
}: GameScreenProps) {
  // added countdown timer state (starts at 10 seconds)
  const [timeLeft, setTimeLeft] = useState(10);

  // countdown from 10 to 0, auto-submit NEUTRAL at 0
  useEffect(() => {
    // reset timer when a new card appears
    if (currentCard && !isWaiting) {
      setTimeLeft(10);

      // set up interval to count down every second
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // time's up! auto-submit NEUTRAL
            console.log("time's up. auto-submitting NEUTRAL");
            makeChoice(currentCard.id, "NEUTRAL");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // cleanup: clear interval when component unmounts or card changes
      return () => clearInterval(timer);
    }
  }, [currentCard, isWaiting, makeChoice]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
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
      {/* top bar with progress and timer */}
      {currentCard && !isWaiting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "32px 48px",
          }}
        >
          {/* progress indicator on left/center */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              {cardIndex + 1} of {totalCards} restaurants
            </Typography>
          </Box>

          {/* timer on right with MUI clock icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon
              sx={{
                fontSize: 24,
                color: timeLeft <= 3 ? "error.main" : "text.secondary"
              }}
            />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                color: timeLeft <= 3 ? "error.main" : "text.secondary"
              }}
            >
              {timeLeft}s
            </Typography>
          </Box>
        </Box>
      )}

      {/* progress bar for timer */}
      {currentCard && !isWaiting && (
        <LinearProgress
          variant="determinate"
          value={(timeLeft / 10) * 100}
          sx={{
            position: "absolute",
            top: 80,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#f0f0f0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: timeLeft <= 3 ? "#ef4444" : "#22c55e",
              transition: "background-color 0.3s"
            }
          }}
        />
      )}

      {/* display round number if it's a runoff round */}
      {roundNumber > 1 && !isWaiting && (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ position: "absolute", top: 100, fontWeight: 500 }}
        >
          Runoff Round {roundNumber} - narrowing down your options!
        </Typography>
      )}

      {/* show current card and choice buttons if player still has cards to rate */}
      {currentCard && !isWaiting && (
        <Paper
          elevation={3}
          sx={{
            maxWidth: 450,
            width: "100%",
            padding: 6,
            borderRadius: 6,
            textAlign: "center",
            mb: 4,
            mt: 8,
          }}
        >
          {/* restaurant icon with gradient - smaller */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
            }}
          >
            <RestaurantIcon sx={{ fontSize: 35, color: "white" }} />
          </Box>

          {/* restaurant name */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {currentCard.name}
          </Typography>

          {/* subtitle */}
          <Typography variant="body1" color="text.secondary">
            Choose wisely!
          </Typography>
        </Paper>
      )}

      {/* three choice buttons for rating the current restaurant */}
      {currentCard && !isWaiting && (
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* NO button - red */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={() => makeChoice(currentCard.id, "NO")}
              sx={{
                width: 70,
                height: 70,
                backgroundColor: "#ef4444",
                color: "white",
                "&:hover": {
                  backgroundColor: "#dc2626",
                },
                mb: 1,
              }}
            >
              <CloseIcon sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="body2" color="error.main" fontWeight="500">
              Nope
            </Typography>
          </Box>

          {/* NEUTRAL button - yellow */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={() => makeChoice(currentCard.id, "NEUTRAL")}
              sx={{
                width: 70,
                height: 70,
                backgroundColor: "#eab308",
                color: "white",
                "&:hover": {
                  backgroundColor: "#ca8a04",
                },
                mb: 1,
              }}
            >
              <RemoveIcon sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#eab308" }} fontWeight="500">
              Maybe
            </Typography>
          </Box>

          {/* YES button - green */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={() => makeChoice(currentCard.id, "YES")}
              sx={{
                width: 70,
                height: 70,
                backgroundColor: "#22c55e",
                color: "white",
                "&:hover": {
                  backgroundColor: "#16a34a",
                },
                mb: 1,
              }}
            >
              <CheckIcon sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="body2" color="success.main" fontWeight="500">
              Love it
            </Typography>
          </Box>
        </Box>
      )}

      {/* show waiting message if player has finished but other player hasn't */}
      {isWaiting && (
        <Paper
          elevation={3}
          sx={{
            maxWidth: 400,
            width: "100%",
            padding: 5,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          {/* people icon with gradient */}
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
            <PeopleIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            You're done!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Waiting for other player to finish...
          </Typography>
        </Paper>
      )}
    </Box>
  );
}