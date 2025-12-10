// source: React library - https://react.dev/

import React from "react";
import { useSocket } from "./hooks/useSocket";
import { IdleScreen } from "./components/IdleScreen";
import { WaitingRoom } from "./components/WaitingRoom";
import { RestaurantInput } from "./components/RestaurantInput";
import { GameScreen } from "./components/GameScreen";
import { ResultsScreen } from "./components/ResultsScreen";

// main app component: orchestrates the game flow by rendering different screens based on game phase
// acts as the root component that manages phase transitions and passes down state/actions to child components
// game flow: idle -> waiting -> input -> playing -> ended
function App() {
  // custom hook that manages websocket connection and all game state
  // provides connection status, current game state, and action functions
  // handles all socket.io events and state updates
  const {
    isConnected, // boolean: true when websocket connection to server is active
    gameState, // object: contains current game phase, room info, cards, matches, etc.
    createRoom, // function to create a new game room (player 1)
    joinRoom, // function to join an existing room with a code (player 2)
    submitRestaurants, // function to submit player's restaurant suggestions
    makeChoice, // function to submit yes/neutral/no choice for current card
    clearError, // function to dismiss error messages
  } = useSocket();

  // reusable inline styles for buttons
  // used for error dismiss button and any other buttons needed
  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid #333",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    marginRight: "10px",
  };

  // reusable inline styles for input fields
  // kept for consistency but currently unused (MUI handles input styling)
  const inputStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };

  // renders the appropriate UI component based on the current game phase
  // uses switch statement to map game phase to corresponding screen component
  // game phases represent the linear flow of the game from start to finish
  const renderContent = () => {
    switch (gameState.gamePhase) {
      // idle phase: initial landing screen where players can create or join a room
      // this is the entry point for all new sessions
      case "idle":
        return (
          <IdleScreen
            isConnected={isConnected}
            createRoom={createRoom}
            joinRoom={joinRoom}
          />
        );

      // waiting phase: room created successfully, showing room code and waiting for second player to join
      // player 1 sees this screen after creating a room
      case "waiting":
        return (
          <WaitingRoom
            roomCode={gameState.roomCode}
            playerCount={gameState.playerCount}
          />
        );

      // input phase: both players are connected and need to submit their restaurant suggestions
      // requires minimum of 3 restaurants from each player
      case "input":
        return (
          <RestaurantInput
            submitRestaurants={submitRestaurants}
          />
        );
  
      // playing phase: players swipe through restaurant cards making yes/neutral/no choices
      // each player sees restaurants in different order (shuffled independently)
      // includes timer that auto-submits neutral if time expires
      case "playing":
        return (
          <GameScreen
            currentCard={gameState.currentCard}
            cardIndex={gameState.cardIndex}
            totalCards={gameState.totalCards}
            roundNumber={gameState.roundNumber}
            isWaiting={gameState.isWaiting}
            makeChoice={makeChoice}
          />
        );

      // ended phase: game complete, display final results with matches and neutral options
      // shows restaurants both players agreed on (matches) and compromise options (neutrals)
      case "ended":
        return (
          <ResultsScreen
            matches={gameState.matches}
            neutrals={gameState.neutrals}
          />
        );

      // fallback for unexpected game states
      // should never happen in normal operation
      default:
        return <p>Unknown state</p>;
    }
  };

  return (
    // root container with basic styling
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* global error display banner */}
      {/* shows error messages from server (e.g. "room not found", "room is full") */}
      {/* includes dismiss x button to clear the error */}
      {gameState.error && (
        <div style={{ marginBottom: "10px" }}>
          {gameState.error}
          <button onClick={clearError} style={{ ...buttonStyle, marginLeft: "10px" }}>×</button>
        </div>
      )}
      {/* render the appropriate content component based on current game phase */}
      {renderContent()}
    </div>
  );
}

export default App;