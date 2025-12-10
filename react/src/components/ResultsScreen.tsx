// source: Material UI components and styling - https://mui.com/

import React from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import { Restaurant } from "../shared/types";

// props interface for results screen
// this screen displays after both players finish voting on all restaurants
interface ResultsScreenProps {
  matches: Restaurant[]; // restaurants where both players voted yes
  neutrals: Restaurant[]; // restaurants with at least one neutral vote and no no votes
}

// results screen component: displays final matches and neutral options
// matches are shown first (both players said yes) - these are the best options
// neutrals are shown second (fallback options where at least one player was okay with it)
// if 2+ matches were found in previous round, this triggers a runoff and this screen shows the final result
export function ResultsScreen({ matches, neutrals }: ResultsScreenProps) {
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
        background: "linear-gradient(135deg, #e6f2e9 0%, #ffe8ca 100%)",
        padding: 0,
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* centered white card containing all UI elements */}
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
        {/* main title indicating game completion */}
        <Typography variant="h4" fontWeight={500} gutterBottom sx={{ mb: 4 }}>
          Game Over!
        </Typography>

        {/* matches section: restaurants both players agreed on (both voted yes) */}
        {/* these are the ideal choices where both players said yes */}
        {/* displays count in parentheses for quick reference */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={500} gutterBottom>
            Matches ({matches.length})
          </Typography>
          
          {matches.length > 0 ? (
            // green background box containing all matched restaurants
            <Box sx={{ 
              backgroundColor: "#e6f2e9", 
              borderRadius: "12px", 
              padding: 3,
              mt: 2 
            }}>
              {/* map over matches array to render each restaurant */}
              {/* uses restaurant id as key for React list rendering */}
              {matches.map((r) => (
                <Typography 
                  key={r.id} 
                  variant="body1" 
                  sx={{ 
                    py: 1,
                    color: "#5aaf86",
                    fontWeight: 500
                  }}
                >
                  ✓ {r.name}
                </Typography>
              ))}
            </Box>
          ) : (
            // fallback message when no matches exist (both players had completely different preferences)
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No matches found
            </Typography>
          )}
        </Box>

        {/* neutral options section: only rendered if neutrals array has items */}
        {/* these are backup/compromise options where at least one player voted neutral and neither voted no */}
        {/* useful when no matches exist - gives players fallback choices */}
        {neutrals.length > 0 && (
          <>
            {/* visual divider between matches and neutral sections */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={500} gutterBottom>
                Neutral Options ({neutrals.length})
              </Typography>
              
              {/* yellow background box containing all neutral restaurants */}
              <Box sx={{ 
                backgroundColor: "#fef3c7", 
                borderRadius: "12px", 
                padding: 3,
                mt: 2 
              }}>
                {/* map over neutrals array to render each restaurant */}
                {/* uses restaurant id as key for React list rendering */}
                {neutrals.map((r) => (
                  <Typography 
                    key={r.id} 
                    variant="body1" 
                    sx={{ 
                      py: 1,
                      color: "#ca8a04",
                      fontWeight: 500
                    }}
                  >
                    {r.name}
                  </Typography>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* play again button: reloads entire page to reset game state */}
        {/* uses window.location.reload() to cause full page refresh */}
        {/* clears all websocket connections and local state */}
        {/* players will need to create/join a new room after clicking this */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            py: 1.8,
            backgroundColor: "#5aaf86",
            color: "white",
            textTransform: "none",
            fontSize: 16,
            borderRadius: "12px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#5aaf86",
              boxShadow: "none",
            },
          }}
        >
          Play Again
        </Button>
      </Paper>
    </Box>
  );
}