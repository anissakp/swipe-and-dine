import React, { useState } from "react";
import { useSocket } from "./hooks/useSocket";

function App() {
  const {
    isConnected,
    gameState,
    createRoom,
    joinRoom,
    submitRestaurants,
    makeChoice,
    clearError,
  } = useSocket();

  const [joinCode, setJoinCode] = useState("");
  const [restaurantInputs, setRestaurantInputs] = useState<string[]>(["", "", ""]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid #333",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    marginRight: "10px",
  };

  const inputStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };

  const renderContent = () => {
    switch (gameState.gamePhase) {
      case "idle":
        return (
          <div>
            <h2>Swipe & Dine</h2>
            <p>
              Connection Status:{" "}
              <span style={{ color: isConnected ? "green" : "red" }}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>

            <div>
              <button onClick={createRoom} disabled={!isConnected} style={{ ...buttonStyle, marginBottom: "10px" }}>
                Create Room
              </button>

              <div>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  style={{ ...inputStyle, marginRight: "10px" }}
                />
                <button
                  onClick={() => joinRoom(joinCode)}
                  disabled={!isConnected || !joinCode}
                  style={buttonStyle}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div>
            <h2>Waiting Room</h2>
            <p>Room Code: <strong>{gameState.roomCode}</strong></p>
            <p>Players: {gameState.playerCount}/2</p>
            <p>Waiting for another player...</p>
          </div>
        );

      case "input":
        return (
          <div>
            <h2>Add Restaurants</h2>
            
            {!hasSubmitted ? (
              <>
                <p>Enter 3 restaurant suggestions:</p>

                {restaurantInputs.map((value, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newInputs = [...restaurantInputs];
                        newInputs[index] = e.target.value;
                        setRestaurantInputs(newInputs);
                      }}
                      placeholder={`Restaurant ${index + 1}`}
                      style={{ ...inputStyle, width: "250px" }}
                    />
                  </div>
                ))}

                <button
                  onClick={() => {
                    const validRestaurants = restaurantInputs.filter((r) => r.trim() !== "");
                    if (validRestaurants.length >= 3) {
                      submitRestaurants(validRestaurants);
                      setHasSubmitted(true);
                    }
                  }}
                  disabled={restaurantInputs.filter((r) => r.trim()).length < 3}
                  style={buttonStyle}
                >
                  Submit Restaurants
                </button>
              </>
            ) : (
              <div style={{ marginTop: "10px" }}>
                <p>Restaurants submitted successfully!</p>
                <p>Waiting for other player to submit their restaurants...</p>
              </div>
            )}
          </div>
        );

      case "playing":
        return (
          <div>
            <h2>Make Your Choice</h2>
            <p>Card {gameState.cardIndex + 1} of {gameState.totalCards}</p>

            {gameState.currentCard && !gameState.isWaiting && (
              <div style={{ marginTop: "20px" }}>
                <h3>{gameState.currentCard.name}</h3>

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

            {gameState.isWaiting && (
              <div>
                <p>You're done! Waiting for other player to finish...</p>
              </div>
            )}
          </div>
        );

      case "ended":
        return (
          <div>
            <h2>Game Over!</h2>

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

            <button onClick={() => window.location.reload()} style={buttonStyle}>
              Play Again
            </button>
          </div>
        );

      default:
        return <p>Unknown state</p>;
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {gameState.error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {gameState.error}
          <button onClick={clearError} style={{ ...buttonStyle, marginLeft: "10px" }}>×</button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;