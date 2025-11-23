import React, { useState } from "react";
import { useSocket } from "./hooks/useSocket";

function App() {
  // hook that manages WebSocket connection and all game-related state/actions
  const {
    isConnected,      // boolean indicating if WebSocket connection is active
    gameState,        // object containing current game phase, room info, cards, matches, etc.
    createRoom,       // function to create a new game room
    joinRoom,         // function to join an existing room with a code
    submitRestaurants,// function to submit player's restaurant suggestions
    makeChoice,       // function to submit yes/neutral/no choice for current card
    clearError,       // function to dismiss error messages
  } = useSocket();

  // local state for the room code input field (used when joining a room)
  const [joinCode, setJoinCode] = useState("");
  
  // CHANGED: local state for restaurant inputs - starts with three empty inputs
  const [restaurantInputs, setRestaurantInputs] = useState<string[]>(["", "", ""]);
  
  // tracks whether current player has submitted their restaurants (prevents re-submission)
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // reusable inline styles for buttons
  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid #333",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    marginRight: "10px",
  };

  // reusable inline styles for input fields
  const inputStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };

  /**
   * renders the appropriate UI based on the current game phase
   * game phases: idle -> waiting -> input -> playing -> ended
   */
  const renderContent = () => {
    switch (gameState.gamePhase) {
      // IDLE PHASE: initial screen where players can create or join a room
      case "idle":
        return (
          <div>
            <h2>Swipe & Dine</h2>
            
            {/* display current WebSocket connection status */}
            <p>
              Connection Status:{" "}
              <span style={{ color: isConnected ? "green" : "red" }}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>

            {/* CHANGED: restructured layout to clearly separate create vs join options */}
            <div style={{ marginTop: "30px" }}>
              {/* CHANGED: create new room section with clear heading and explanation */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ marginTop: "0" }}>Start a New Game</h3>
                <p>Create a room and share the code with your friend</p>
                <button onClick={createRoom} disabled={!isConnected} style={buttonStyle}>
                  Create Room
                </button>
              </div>

              {/* CHANGED: join existing room section with clear heading, explanation, and "Join Room" button label */}
              <div>
                <h3 style={{ marginTop: "0" }}>Join Existing Room</h3>
                <p>Enter the room code your friend shared with you</p>
                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())} // auto-uppercase room codes
                    placeholder="Enter room code"
                    style={{ ...inputStyle, marginRight: "10px" }}
                  />
                  <button
                    onClick={() => joinRoom(joinCode)}
                    disabled={!isConnected || !joinCode} // disabled if not connected or no code entered
                    style={buttonStyle}
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // WAITING PHASE: room created, waiting for second player to join
      case "waiting":
        return (
          <div>
            <h2>Waiting Room</h2>
            <p>Room Code: <strong>{gameState.roomCode}</strong></p>
            <p>Players: {gameState.playerCount}/2</p>
            <p>Waiting for another player...</p>
          </div>
        );

      // INPUT PHASE: both players submit their restaurant suggestions
      case "input":
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

      // PLAYING PHASE: players swipe through restaurant cards making choices
      case "playing":
        return (
          <div>
            <h2>Make Your Choice</h2>
            {/* CHANGED: display round number if it's a runoff round */}
            {gameState.roundNumber > 1 && (
              <p>
                Runoff Round {gameState.roundNumber} - narrowing down your options!
              </p>
            )}
            {/* display progress through the deck */}
            <p>Card {gameState.cardIndex + 1} of {gameState.totalCards}</p>

            {/* show current card and choice buttons if player still has cards to rate */}
            {gameState.currentCard && !gameState.isWaiting && (
              <div style={{ marginTop: "20px" }}>
                <h3>{gameState.currentCard.name}</h3>

                {/* three choice buttons for rating the current restaurant */}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => makeChoice(gameState.currentCard!.id, "YES")} style={buttonStyle}>
                    YES
                  </button>
                  <button onClick={() => makeChoice(gameState.currentCard!.id, "NEUTRAL")} style={buttonStyle}>
                    NEUTRAL
                  </button>
                  <button onClick={() => makeChoice(gameState.currentCard!.id, "NO")} style={buttonStyle}>
                    NO
                  </button>
                </div>
              </div>
            )}

            {/* show waiting message if player has finished but other player hasn't */}
            {gameState.isWaiting && (
              <div>
                <p>You're done! Waiting for other player to finish...</p>
              </div>
            )}
          </div>
        );

      // ENDED PHASE: game complete, display results and matches
      case "ended":
        return (
          <div>
            <h2>Game Over!</h2>

            {/* display restaurants both players said YES to */}
            <div>
              <h3>Matches ({gameState.matches.length})</h3>
              {gameState.matches.length > 0 ? (
                <ul>
                  {gameState.matches.map((r) => (
                    <li key={r.id}>✓ {r.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No matches found</p>
              )}
            </div>

            {/* display restaurants where at least one player was neutral (fallback options) */}
            {gameState.neutrals.length > 0 && (
              <div>
                <h3>Neutral Options ({gameState.neutrals.length})</h3>
                <ul>
                  {gameState.neutrals.map((r) => (
                    <li key={r.id}>~ {r.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* reload page to start a fresh game */}
            <button onClick={() => window.location.reload()} style={buttonStyle}>
              Play Again
            </button>
          </div>
        );

      // fallback for unexpected game states
      default:
        return <p>Unknown state</p>;
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* global error display with dismiss button */}
      {gameState.error && (
        <div style={{ marginBottom: "10px" }}>
          {gameState.error}
          <button onClick={clearError} style={{ ...buttonStyle, marginLeft: "10px" }}>×</button>
        </div>
      )}
      {/* render the appropriate content based on current game phase */}
      {renderContent()}
    </div>
  );
}

export default App;