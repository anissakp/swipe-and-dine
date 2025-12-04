import React, { useState } from "react";

interface IdleScreenProps {
  isConnected: boolean;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  buttonStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export function IdleScreen({ isConnected, createRoom, joinRoom, buttonStyle, inputStyle }: IdleScreenProps) {
  // local state for the room code input field (used when joining a room)
  const [joinCode, setJoinCode] = useState("");

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
}