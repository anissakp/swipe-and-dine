import React, { useState, useEffect } from "react";
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
  // countdown timer state (starts at 10 seconds)
  const [timeLeft, setTimeLeft] = useState(10);

  // timer logic - countdown from 10 to 0, auto-submit neutral at 0
  useEffect(() => {
    // reset timer when a new card appears
    if (currentCard && !isWaiting) {
      setTimeLeft(10);

      // set up interval to count down every second
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // the time's up so auto-submit neutral
            console.log("time's up, auto submit to neutral");
            makeChoice(currentCard.id, "NEUTRAL");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // cleanup: clear interval when component unmounts or card changes
      return () => clearInterval(timer);
    }
  }, [currentCard, isWaiting, makeChoice]);

  return (
    <div>
      <h2>Make Your Choice</h2>
      
      {/* display round number if it's a runoff round */}
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
          {/* countdown timer display */}
          <div style={{ 
            marginBottom: "15px", 
            fontSize: "24px", 
            fontWeight: "bold",
            color: timeLeft <= 3 ? "red" : "black" // turn red when time running out
          }}>
            ⏱ {timeLeft}s
          </div>

          {/* visual progress bar */}
          <div style={{ 
            width: "100%", 
            height: "10px", 
            backgroundColor: "#e0e0e0", 
            borderRadius: "5px",
            marginBottom: "20px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${(timeLeft / 10) * 100}%`,
              height: "100%",
              backgroundColor: timeLeft <= 3 ? "#ff4444" : "#4CAF50",
              transition: "width 1s linear, background-color 0.3s"
            }} />
          </div>

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