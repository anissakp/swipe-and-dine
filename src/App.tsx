import { useState, useEffect } from 'react';
import { InputScreen } from './components/InputScreen';
import { WaitingRoom } from './components/WaitingRoom';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';

export type Restaurant = {
  id: string;
  name: string;
};

export type Choice = 'YES' | 'NO' | 'NEUTRAL' | null;

export type GameState = 'input' | 'waiting' | 'playing' | 'results';

function App() {
  const [gameState, setGameState] = useState<GameState>('input');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Restaurant[]>([]);
  const [neutrals, setNeutrals] = useState<Restaurant[]>([]);
  const [playerName, setPlayerName] = useState('Player 1');

  const handleSubmitRestaurants = (restaurantNames: string[]) => {
    // Convert to restaurant objects
    const newRestaurants = restaurantNames.map((name, i) => ({
      id: `rest-${i}`,
      name
    }));
    
    // Simulate server merging with another player's restaurants
    const mockOtherPlayerRestaurants = [
      { id: 'rest-other-1', name: 'Olive Garden' },
      { id: 'rest-other-2', name: 'Cheesecake Factory' }
    ];
    
    const allRestaurants = [...newRestaurants, ...mockOtherPlayerRestaurants];
    
    // Remove duplicates and shuffle
    const unique = allRestaurants.filter((rest, index, self) => 
      index === self.findIndex((r) => r.name.toLowerCase() === rest.name.toLowerCase())
    );
    
    const shuffled = unique.sort(() => Math.random() - 0.5);
    
    setRestaurants(shuffled);
    setGameState('waiting');
    
    // Simulate waiting for other player
    setTimeout(() => {
      setGameState('playing');
    }, 2000);
  };

  const handleChoice = (choice: Choice) => {
    const currentRestaurant = restaurants[currentIndex];
    
    // Simulate other player's choice (random for demo)
    const otherPlayerChoice = ['YES', 'NO', 'NEUTRAL'][Math.floor(Math.random() * 3)] as Choice;
    
    // Check for match
    if (choice === 'YES' && otherPlayerChoice === 'YES') {
      setMatches(prev => [...prev, currentRestaurant]);
    } else if (choice === 'NEUTRAL' || otherPlayerChoice === 'NEUTRAL') {
      if (!matches.find(m => m.id === currentRestaurant.id)) {
        setNeutrals(prev => [...prev, currentRestaurant]);
      }
    }
    
    // Move to next restaurant
    if (currentIndex < restaurants.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Game over
      setTimeout(() => {
        setGameState('results');
      }, 500);
    }
  };

  const handlePlayAgain = () => {
    setGameState('input');
    setCurrentIndex(0);
    setMatches([]);
    setNeutrals([]);
    setRestaurants([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
      {gameState === 'input' && (
        <InputScreen 
          onSubmit={handleSubmitRestaurants}
          playerName={playerName}
          onNameChange={setPlayerName}
        />
      )}
      
      {gameState === 'waiting' && (
        <WaitingRoom playerName={playerName} />
      )}
      
      {gameState === 'playing' && restaurants.length > 0 && (
        <GameScreen
          restaurant={restaurants[currentIndex]}
          currentIndex={currentIndex}
          totalRestaurants={restaurants.length}
          onChoice={handleChoice}
          playerName={playerName}
        />
      )}
      
      {gameState === 'results' && (
        <ResultsScreen
          matches={matches}
          neutrals={neutrals}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
