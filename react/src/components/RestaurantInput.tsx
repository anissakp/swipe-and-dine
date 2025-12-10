// source: Material UI components and styling - https://mui.com/
// source: Material UI icons - https://mui.com/material-ui/material-icons/

import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

// props interface for restaurant input screen
// this screen allows each player to input their restaurant preferences
interface RestaurantInputProps {
  submitRestaurants: (restaurants: string[]) => void; // function to send restaurant list to server via websocket
}

// restaurant input component: allows players to add and submit their restaurant preferences
// each player must add at least 3 restaurants before submitting
// players can add more than 3 restaurants using the "add another" button
// after submission, shows waiting message until other player submits
export function RestaurantInput({ submitRestaurants }: RestaurantInputProps) {
  // local state for restaurant inputs - starts with three empty input fields
  // array of strings where each string represents one restaurant name
  // can grow beyond 3 as user adds more restaurants
  const [restaurantInputs, setRestaurantInputs] = useState<string[]>(["", "", ""]);
  
  // tracks whether current player has submitted their restaurants
  // prevents re-submission and switches UI to waiting message
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

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
        {/* main title */}
        <Typography variant="h4" gutterBottom>
          Add Restaurants
        </Typography>
        
        {/* conditional rendering: show input form if player hasn't submitted yet */}
        {!hasSubmitted ? (
          <>
            {/* instruction text explaining minimum requirement */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Add at least 3 restaurants
            </Typography>

            {/* container for all restaurant input fields */}
            {/* displays all inputs at once */}
            <Box sx={{ mb: 3 }}>
              {restaurantInputs.map((restaurant, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={restaurant}
                  onChange={(e) => {
                    // update specific input field when user types
                    // creates new array to maintain immutability
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

            {/* add button to dynamically add more restaurant input fields */}
            {/* appends empty string to restaurantInputs array */}
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

            {/* submit button - only enabled when at least 3 fields have non-empty content */}
            {/* button text shows current count of filled inputs vs minimum required (3) */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                // filter out empty/whitespace-only inputs to get valid restaurant list
                const validRestaurants = restaurantInputs.filter((r) => r.trim() !== "");
                // validate minimum of 3 restaurants before sending to server
                if (validRestaurants.length >= 3) {
                  submitRestaurants(validRestaurants); // send to server via websocket
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
                  backgroundColor: "#b0b0b0",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#909090",
                    boxShadow: "none",
                  },
                },
              }}
            >
              Submit Restaurants ({restaurantInputs.filter(r => r.trim()).length}/3 minimum)
            </Button>
          </>
        ) : (
          // confirmation message displayed after successful submission
          // tells user to wait for other player to submit their restaurants
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Restaurants submitted successfully!
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