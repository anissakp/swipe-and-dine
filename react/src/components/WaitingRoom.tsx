import React from "react";

interface WaitingRoomProps {
  roomCode: string | null;
  playerCount: number;
}

export function WaitingRoom({ roomCode, playerCount }: WaitingRoomProps) {
  return (
    <div>
      <h2>Waiting Room</h2>
      <p>Room Code: <strong>{roomCode}</strong></p>
      <p>Players: {playerCount}/2</p>
      <p>Waiting for another player...</p>
    </div>
  );
}