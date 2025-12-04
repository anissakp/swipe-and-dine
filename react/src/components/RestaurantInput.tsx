import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

interface RestaurantInputProps {
  submitRestaurants: (restaurants: string[]) => void;
}

export function RestaurantInput({ submitRestaurants }: RestaurantInputProps) {
  // local state for restaurant inputs - starts with three empty inputs
  const [restaurantInputs, setRestaurantInputs] = useState<string[]>(["", "", ""]);
  
  // tracks whether current player has submitted their restaurants (prevents re-submission)
  const [hasSubmitted, setHasSubmitted] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #fef2f2 100%)",
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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Add Restaurants
        </Typography>
        
        {/* show input form if player hasn't submitted yet */}
        {!hasSubmitted ? (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Add at least 3 restaurants
            </Typography>

            {/* show all input fields at once (removed navigation/current index logic) */}
            <Box sx={{ mb: 3 }}>
              {restaurantInputs.map((restaurant, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={restaurant}
                  onChange={(e) => {
                    // update any input directly 
                    const newInputs = [...restaurantInputs];
                    newInputs[index] = e.target.value;
                    setRestaurantInputs(newInputs);
                  }}
                  placeholder={`Restaurant ${index + 1}`}
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
                    },
                  }}
                />
              ))}
            </Box>

            {/* plus button to add another input */}
            <Button
              variant="text"
              onClick={() => setRestaurantInputs([...restaurantInputs, ""])}
              sx={{ 
                mb: 3, 
                textTransform: "none",
                color: "#2196F3",
                fontSize: "15px",
                fontWeight: 400,
              }}
            >
              + Add Another Restaurant
            </Button>

            {/* submit button - only enabled when at least 3 fields have content */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                // filter out empty inputs and validate there are at least 3
                const validRestaurants = restaurantInputs.filter((r) => r.trim() !== "");
                if (validRestaurants.length >= 3) {
                  submitRestaurants(validRestaurants); // send to server via WebSocket
                  setHasSubmitted(true); // update local state to show waiting message
                }
              }}
              disabled={restaurantInputs.filter((r) => r.trim()).length < 3}
              sx={{ 
                textTransform: "none",
                fontSize: "16px",
                py: 1.8,
                borderRadius: "12px",
                boxShadow: "none",
                "&.Mui-disabled": {
                  backgroundColor: "#e8e8e8",
                  color: "#b0b0b0",
                },
                "&:not(.Mui-disabled)": {
                  backgroundColor: "#8b9499",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#727a7fff",
                    boxShadow: "none",
                  },
                },
              }}
            >
              Submit Restaurants ({restaurantInputs.filter(r => r.trim()).length}/3 minimum)
            </Button>
          </>
        ) : (
          // show confirmation message after submission
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              ✓ Restaurants submitted successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Waiting for other player to submit their restaurants...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}