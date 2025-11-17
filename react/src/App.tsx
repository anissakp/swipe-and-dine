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
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Swipe & Dine</h2>
            <p className="text-gray-600">
              Connection Status:{" "}
              <span className={isConnected ? "text-green-500" : "text-red-500"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>

            <div className="space-y-2">
              <button
                onClick={createRoom}
                disabled={!isConnected}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Create Room
              </button>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  onClick={() => joinRoom(joinCode)}
                  disabled={!isConnected || !joinCode}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Waiting Room</h2>
            <p className="text-lg">
              Room Code:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {gameState.roomCode}
              </span>
            </p>
            <p className="text-gray-600">Players: {gameState.playerCount}/2</p>
            <p className="animate-pulse">Waiting for another player...</p>
          </div>
        );

      case "input":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add Restaurants</h2>
            <p className="text-gray-600">Enter 3 restaurant suggestions:</p>

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
                className="w-full border rounded px-3 py-2"
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
              className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Submit Restaurants
            </button>
          </div>
        );

      case "playing":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Make Your Choice</h2>
            <p className="text-gray-600">
              Card {gameState.cardIndex + 1} of {gameState.totalCards}
            </p>

            {gameState.currentCard && (
              <div className="bg-white shadow-lg rounded-lg p-8 border-2 border-gray-200">
                <h3 className="text-3xl font-bold mb-4">
                  {gameState.currentCard.name}
                </h3>

                {gameState.lastResult && (
                  <div
                    className={`mb-4 p-2 rounded ${
                      gameState.lastResult.isMatch
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {gameState.lastResult.isMatch
                      ? "🎉 MATCH!"
                      : "No match - next card coming..."}
                  </div>
                )}

                {gameState.isWaiting ? (
                  <p className="text-yellow-600 animate-pulse">
                    Waiting for other player...
                  </p>
                ) : (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => makeChoice(gameState.currentCard!.id, "YES")}
                      className="bg-green-500 text-white py-3 px-8 rounded-lg text-xl hover:bg-green-600"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => makeChoice(gameState.currentCard!.id, "NEUTRAL")}
                      className="bg-yellow-500 text-white py-3 px-8 rounded-lg text-xl hover:bg-yellow-600"
                    >
                      NEUTRAL
                    </button>
                    <button
                      onClick={() => makeChoice(gameState.currentCard!.id, "NO")}
                      className="bg-red-500 text-white py-3 px-8 rounded-lg text-xl hover:bg-red-600"
                    >
                      NO
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "ended":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">🎉 Game Over!</h2>

            <div className="bg-green-50 p-4 rounded">
              <h3 className="text-xl font-semibold text-green-700">
                Matches ({gameState.matches.length})
              </h3>
              {gameState.matches.length > 0 ? (
                <ul className="mt-2">
                  {gameState.matches.map((r) => (
                    <li key={r.id} className="text-green-600">
                      ✓ {r.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No matches found</p>
              )}
            </div>

            {gameState.neutrals.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="text-xl font-semibold text-yellow-700">
                  Neutral Options ({gameState.neutrals.length})
                </h3>
                <ul className="mt-2">
                  {gameState.neutrals.map((r) => (
                    <li key={r.id} className="text-yellow-600">
                      ~ {r.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        {gameState.error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {gameState.error}
            <button onClick={clearError} className="absolute top-0 right-0 px-4 py-3">
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