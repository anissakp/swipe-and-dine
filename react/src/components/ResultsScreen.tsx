import React from "react";
import { Restaurant } from "../shared/types";

interface ResultsScreenProps {
  matches: Restaurant[];
  neutrals: Restaurant[];
  buttonStyle: React.CSSProperties;
}

export function ResultsScreen({ matches, neutrals, buttonStyle }: ResultsScreenProps) {
  return (
    <div>
      <h2>Game Over!</h2>

      {/* display restaurants both players said YES to */}
      <div>
        <h3>Matches ({matches.length})</h3>
        {matches.length > 0 ? (
          <ul>
            {matches.map((r) => (
              <li key={r.id}>✓ {r.name}</li>
            ))}
          </ul>
        ) : (
          <p>No matches found</p>
        )}
      </div>

      {/* display restaurants where at least one player was neutral (fallback options) */}
      {neutrals.length > 0 && (
        <div>
          <h3>Neutral Options ({neutrals.length})</h3>
          <ul>
            {neutrals.map((r) => (
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
}