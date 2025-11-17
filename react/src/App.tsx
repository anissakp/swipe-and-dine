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

  const renderContent = () => {
    switch (gameState.gamePhase) {
      case "idle":
        return (
          <div>
            <h2>Swipe & Dine</h2>
            <p>
              Connection Status:{" "}
              <span>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>

            <div>
              <button
                onClick={createRoom}
                disabled={!isConnected}
              >
                Create Room
              </button>

              <div>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                />
                <button
                  onClick={() => joinRoom(joinCode)}
                  disabled={!isConnected || !joinCode}
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
            <p>
              Room Code:{" "}
              <span>
                {gameState.roomCode}
              </span>
            </p>
            <p>Players: {gameState.playerCount}/2</p>
            <p>Waiting for another player...</p>
          </div>
        );

      case "input":
        return (
          <div>
            <h2>Add Restaurants</h2>
            <p>Enter 3 restaurant suggestions:</p>

            {restaurantInputs.map((value, index) => (
              <input
                key={index}
                type="text"
                value={value}
                onChange={(e) => {
                  const newInputs = [...restaurantInputs];
                  newInputs[index] = e.target.value;
                  setRestaurantInputs(newInputs);
                }}
                placeholder={`Restaurant ${index + 1}`}
              />
            ))}

            <button
              onClick={() => {
                const validRestaurants = restaurantInputs.filter((r) => r.trim() !== "");
                if (validRestaurants.length >= 3) {
                  submitRestaurants(validRestaurants);
                }
              }}
              disabled={restaurantInputs.filter((r) => r.trim()).length < 3}
            >
              Submit Restaurants
            </button>
          </div>
        );

      case "playing":
        return (
          <div>
            <h2>Make Your Choice</h2>
            <p>
              Card {gameState.cardIndex + 1} of {gameState.totalCards}
            </p>

            {gameState.currentCard && !gameState.isWaiting && (
              <div>
                <h3>
                  {gameState.currentCard.name}
                </h3>

                <div>
                  <button
                    onClick={() => makeChoice(gameState.currentCard!.id, "YES")}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => makeChoice(gameState.currentCard!.id, "NEUTRAL")}
                  >
                    NEUTRAL
                  </button>
                  <button
                    onClick={() => makeChoice(gameState.currentCard!.id, "NO")}
                  >
                    NO
                  </button>
                </div>
              </div>
            )}

            {gameState.isWaiting && (
              <div>
                <p>
                  You're done! Waiting for other player to finish...
                </p>
              </div>
            )}
          </div>
        );

      case "ended":
        return (
          <div>
            <h2>🎉 Game Over!</h2>

            <div>
              <h3>
                Matches ({gameState.matches.length})
              </h3>
              {gameState.matches.length > 0 ? (
                <ul>
                  {gameState.matches.map((r) => (
                    <li key={r.id}>
                      ✓ {r.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No matches found</p>
              )}
            </div>

            {gameState.neutrals.length > 0 && (
              <div>
                <h3>
                  Neutral Options ({gameState.neutrals.length})
                </h3>
                <ul>
                  {gameState.neutrals.map((r) => (
                    <li key={r.id}>
                      ~ {r.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        );

      default:
        return <p>Unknown state</p>;
    }
  };

  return (
    <div>
      <div>
        {gameState.error && (
          <div>
            {gameState.error}
            <button onClick={clearError}>
              ×
            </button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;