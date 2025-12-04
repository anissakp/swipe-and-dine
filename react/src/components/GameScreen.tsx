import React from "react";
import { Restaurant, Choice } from "../shared/types";

interface GameScreenProps {
  currentCard: Restaurant | null;
  cardIndex: number;
  totalCards: number;
  roundNumber: number;
  isWaiting: boolean;
  makeChoice: (restaurantId: string, choice: Choice) => void;
  buttonStyle: React.CSSProperties;
}

export function GameScreen({ 
  currentCard, 
  cardIndex, 
  totalCards, 
  roundNumber, 
  isWaiting, 
  makeChoice, 
  buttonStyle 
}: GameScreenProps) {
  return (
    <div>
      <h2>Make Your Choice</h2>
      
      {/* CHANGED: display round number if it's a runoff round */}
      {roundNumber > 1 && (
        <p>
          Runoff Round {roundNumber} - narrowing down your options!
        </p>
      )}
      
      {/* display progress through the deck */}
      <p>Card {cardIndex + 1} of {totalCards}</p>

      {/* show current card and choice buttons if player still has cards to rate */}
      {currentCard && !isWaiting && (
        <div style={{ marginTop: "20px" }}>
          <h3>{currentCard.name}</h3>

          {/* three choice buttons for rating the current restaurant */}
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => makeChoice(currentCard.id, "YES")} style={buttonStyle}>
              YES
            </button>
            <button onClick={() => makeChoice(currentCard.id, "NEUTRAL")} style={buttonStyle}>
              NEUTRAL
            </button>
            <button onClick={() => makeChoice(currentCard.id, "NO")} style={buttonStyle}>
              NO
            </button>
          </div>
        </div>
      )}

      {/* show waiting message if player has finished but other player hasn't */}
      {isWaiting && (
        <div>
          <p>You're done! Waiting for other player to finish...</p>
        </div>
      )}
    </div>
  );
}