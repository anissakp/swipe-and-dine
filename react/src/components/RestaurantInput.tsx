import React, { useState } from "react";

interface RestaurantInputProps {
  submitRestaurants: (restaurants: string[]) => void;
  buttonStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export function RestaurantInput({ submitRestaurants, buttonStyle, inputStyle }: RestaurantInputProps) {
  // CHANGED: local state for restaurant inputs - starts with three empty inputs
  const [restaurantInputs, setRestaurantInputs] = useState<string[]>(["", "", ""]);
  
  // tracks whether current player has submitted their restaurants (prevents re-submission)
  const [hasSubmitted, setHasSubmitted] = useState(false);

  return (
    <div>
      <h2>Add Restaurants</h2>
      
      {/* show input form if player hasn't submitted yet */}
      {!hasSubmitted ? (
        <>
          <p>Add at least 3 restaurants</p>

          {/* CHANGED: show all input fields at once (removed navigation/current index logic) */}
          <div style={{ marginBottom: "20px" }}>
            {restaurantInputs.map((restaurant, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  value={restaurant}
                  onChange={(e) => {
                    // CHANGED: update any input directly (no currentInputIndex needed)
                    const newInputs = [...restaurantInputs];
                    newInputs[index] = e.target.value;
                    setRestaurantInputs(newInputs);
                  }}
                  placeholder={`Restaurant ${index + 1}`}
                  style={{ ...inputStyle, width: "250px" }}
                />
              </div>
            ))}
          </div>

          {/* CHANGED: plus button to add another input */}
          <button
            onClick={() => setRestaurantInputs([...restaurantInputs, ""])}
            style={{ ...buttonStyle, marginBottom: "20px" }}
          >
            + Add Another Restaurant
          </button>

          {/* submit button - only enabled when at least 3 fields have content */}
          <button
            onClick={() => {
              // CHANGED: filter out empty inputs and validate there are at least 3
              const validRestaurants = restaurantInputs.filter((r) => r.trim() !== "");
              if (validRestaurants.length >= 3) {
                submitRestaurants(validRestaurants); // send to server via WebSocket
                setHasSubmitted(true); // update local state to show waiting message
              }
            }}
            disabled={restaurantInputs.filter((r) => r.trim()).length < 3}
            style={buttonStyle}
          >
            Submit Restaurants ({restaurantInputs.filter(r => r.trim()).length}/3 minimum)
          </button>
        </>
      ) : (
        // show confirmation message after submission
        <div style={{ marginTop: "10px" }}>
          <p>Restaurants submitted successfully!</p>
          <p>Waiting for other player to submit their restaurants...</p>
        </div>
      )}
    </div>
  );
}