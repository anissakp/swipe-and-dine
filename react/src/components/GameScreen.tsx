// GameScreen.tsx
// source: Material UI components and styling - https://mui.com/
// source: Material UI icons - https://mui.com/material-ui/material-icons/
// source: React hooks documentation - https://react.dev/reference/react

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, LinearProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckIcon from "@mui/icons-material/Check";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Restaurant, Choice } from "../shared/types";
import PeopleIcon from "@mui/icons-material/People";

// props interface for game screen
// this is the main gameplay screen where players swipe/rate restaurants
interface GameScreenProps {
  currentCard: Restaurant | null; // currently displayed restaurant card, null when no cards left
  cardIndex: number; // index of current card in the deck
  totalCards: number; // total number of restaurants to rate in this round
  roundNumber: number; // current round number (1 for initial, 2+ for runoff rounds)
  isWaiting: boolean; // true when current player finished but waiting for other player
  makeChoice: (restaurantId: string, choice: Choice) => void; // function to submit rating to server
}

// game screen component: main gameplay interface for rating restaurants
// displays one restaurant at a time with three rating options (yes/neutral/no)
// includes 10-second countdown timer that auto-submits neutral if time runs out
// shows progress indicator and handles runoff rounds
// transitions to waiting screen when current player finishes all cards
export function GameScreen({
  currentCard,
  cardIndex,
  totalCards,
  roundNumber,
  isWaiting,
  makeChoice
}: GameScreenProps) {
  // countdown timer state - tracks seconds remaining for current card
  // starts at 10 seconds and counts down to 0
  // resets to 10 when new card appears
  const [timeLeft, setTimeLeft] = useState<number>(10);

  // countdown timer effect - runs every second to decrement timer
  // automatically submits neutral choice when timer reaches 0
  // resets to 10 seconds whenever a new card appears
  useEffect(() => {
    // only run timer when there's a card to rate and player isn't waiting
    if (currentCard && !isWaiting) {
      setTimeLeft(10);

      // set up interval to decrement timer every 1000ms (1 second)
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // time expired - auto-submit neutral choice for current restaurant
            console.log("time's up. auto-submitting NEUTRAL");
            makeChoice(currentCard.id, "NEUTRAL");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // cleanup function: clear interval when component unmounts or dependencies change
      // prevents multiple timers running simultaneously
      return () => clearInterval(timer);
    }
  }, [currentCard, isWaiting, makeChoice]);

  return (
    // full-screen container with gradient background
    // uses fixed positioning to cover entire viewport
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e6f2e9 0%, #ffe8ca 100%)",
        padding: 0,
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* top bar containing progress indicator and timer */}
      {/* only shown when there's a card to rate and player isn't waiting */}
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
          {/* progress indicator showing current position in deck */}
          {/* displays as "X of Y restaurants" (e.g. "3 of 10 restaurants") */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              {cardIndex + 1} of {totalCards} restaurants
            </Typography>
          </Box>

          {/* countdown timer display with clock icon */}
          {/* turns red when 3 seconds or less remain */}
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

      {/* linear progress bar visualizing time remaining */}
      {/* fills from left to right as time decreases */}
      {/* turns red when 3 seconds or less remain */}
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
              backgroundColor: timeLeft <= 3 ? "#ef4444" : "#5aaf86",
              transition: "background-color 0.3s"
            }
          }}
        />
      )}

      {/* runoff round indicator - only shown when roundNumber > 1 */}
      {/* informs players they're in a tiebreaker round to narrow down matches */}
      {roundNumber > 1 && !isWaiting && (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ position: "absolute", top: 100, fontWeight: 500 }}
        >
          Runoff Round {roundNumber} - Narrowing down your options!
        </Typography>
      )}

      {/* restaurant card displaying current restaurant name */}
      {/* only shown when there's a card to rate and player isn't waiting */}
      {currentCard && !isWaiting && (
        <Paper
          elevation={5}
          sx={{
            maxWidth: 500,
            width: "100%",
            padding: 6,
            borderRadius: 12,
            textAlign: "center",
            mb: 4,
            mt: 8,
            boxShadow: "0 10px 30px 10px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.10)",
          }}
        >
          {/* restaurant name displayed prominently */}
          <Typography variant="h4" fontWeight={500} gutterBottom>
            {currentCard.name}
          </Typography>
        </Paper>
      )}

      {/* three choice buttons for rating the current restaurant */}
      {/* no (red/X), neutral (yellow/-), yes (green/checkmark) */}
      {/* only shown when there's a card to rate and player isn't waiting */}
      {currentCard && !isWaiting && (
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* NO button - red circle with X icon */}
          {/* indicates player does not want this restaurant */}
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
              No
            </Typography>
          </Box>

          {/* neutral button - yellow circle with minus icon */}
          {/* indicates player is indifferent about this restaurant */}
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
              Neutral
            </Typography>
          </Box>

          {/* yes button - green circle with checkmark icon */}
          {/* indicates player wants this restaurant */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={() => makeChoice(currentCard.id, "YES")}
              sx={{
                width: 70,
                height: 70,
                backgroundColor: "#5aaf86",
                color: "white",
                "&:hover": {
                  backgroundColor: "#4d9b7f",
                },
                mb: 1,
              }}
            >
              <CheckIcon sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#5aaf86" }} fontWeight="500">
              Yes
            </Typography>
          </Box>
        </Box>
      )}

      {/* waiting screen shown when current player has finished rating all cards */}
      {/* displays until other player also finishes, then transitions to results */}
      {isWaiting && (
        <Paper
          elevation={5}
          sx={{
            maxWidth: 500,
            width: "100%",
            padding: 5,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 10px 30px 10px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.10)",
          }}
        >
          {/* circular gradient background with people icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffb263, #ffc16e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          {/* confirmation message */}
          <Typography variant="h4" fontWeight={500} gutterBottom>
            You're done!
          </Typography>
          {/* waiting message until other player completes their ratings */}
          <Typography variant="body1" color="text.secondary">
            Waiting for other player to finish...
          </Typography>
        </Paper>
      )}
    </Box>
  );
}