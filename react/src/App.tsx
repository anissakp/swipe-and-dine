import React from "react";
import { useSocket } from "./hooks/useSocket";
import { IdleScreen } from "./components/IdleScreen";
import { WaitingRoom } from "./components/WaitingRoom";
import { RestaurantInput } from "./components/RestaurantInput";
import { GameScreen } from "./components/GameScreen";
import { ResultsScreen } from "./components/ResultsScreen";

function App() {
  // custom hook that manages WebSocket connection and all game state
  // returns connection status, game state, and action functions
  const {
    isConnected,      // boolean: true when WebSocket connection to server is active
    gameState,        // object: contains current game phase, room info, cards, matches, etc.
    createRoom,       // function to create a new game room
    joinRoom,         // function to join an existing room with a code
    submitRestaurants,// function to submit player's restaurant suggestions
    makeChoice,       // function to submit yes/neutral/no choice for current card
    clearError,       // function to dismiss error messages
  } = useSocket();

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
          <IdleScreen
            isConnected={isConnected}
            createRoom={createRoom}
            joinRoom={joinRoom}
          />
        );

      // WAITING PHASE: room created, waiting for second player to join
      case "waiting":
        return (
          <WaitingRoom
            roomCode={gameState.roomCode}
            playerCount={gameState.playerCount}
          />
        );

      // INPUT PHASE: both players submit their restaurant suggestions
      case "input":
        return (
          <RestaurantInput
            submitRestaurants={submitRestaurants}
          />
        );
  
      // PLAYING PHASE: players swipe through restaurant cards making choices
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

      // ENDED PHASE: game complete, display results and matches
      case "ended":
        return (
          <ResultsScreen
            matches={gameState.matches}
            neutrals={gameState.neutrals}
            buttonStyle={buttonStyle}
          />
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

// data flow
// 1. player 1 creates / joins room -> websocket event -> server assigns room
// 2. players submit restaurants -> arrays sent to server -> combined into deck
// 3. server shuffles deck -> sends cards one by one
// 4. players vote -> votes sent to server -> server calculates matches
// 5. if multiple matches -> runoff round with just those restaurants
// 6. final results displayed