// types.ts
// source: TypeScript documentation - https://www.typescriptlang.org/docs/

// represents a player's voting choice for a restaurant
// three options allow for nuanced matching between players
// yes = want this restaurant, no = don't want, neutral = indifferent/okay with it
export type Choice = "YES" | "NO" | "NEUTRAL";

// represents a single restaurant in the game
// used to track restaurants throughout the voting process
export interface Restaurant {
  id: string; // unique identifier (format: "lowercase-name-timestamp-random")
  name: string; // display name of the restaurant (as entered by players)
}

// represents a player's choice for a specific restaurant
// used to track voting decisions in the game
export interface PlayerChoice {
  oderId: string;  // identifier for the order/restaurant being voted on
  choice: Choice;  // the player's yes/no/neutral decision
}

// represents the result after both players vote on a restaurant
// used to communicate match outcomes between server and client
export interface MatchResult {
  restaurantId: string; // unique identifier of the restaurant
  restaurantName: string; // display name of the restaurant
  isMatch: boolean; // true if both players voted yes, false otherwise
}

// defines all events that the server can send to clients
// typed interface ensures type safety for socket.io communications
export interface ServerToClientEvents {
  // room management events
  roomCreated: (roomCode: string) => void; // sent after successful room creation with unique 6-character code
  playerJoined: (playerCount: number) => void; // sent when player count changes (0-2)
  
  // game flow events
  gameStart: (restaurants: Restaurant[]) => void; // sent when both players submit restaurants, game begins
  showCard: (restaurant: Restaurant, cardIndex: number, totalCards: number) => void; // sent to show next card to rate with progress
  waitingForOther: () => void; // sent when player finishes all cards but waiting for other player
  newRound: (roundNumber: number, restaurants: Restaurant[]) => void; // sent when runoff round starts (happens when 2+ matches found)
  cardResult: (result: MatchResult) => void; // sent after both players vote on a card to show if it matched
  gameEnd: (matches: Restaurant[], neutrals: Restaurant[]) => void; // sent with final results when game completes
  
  // error handling
  error: (message: string) => void; // sent when error occurs (room not found, room full, not in room, etc)
}

// defines all events that clients can send to the server
// typed interface ensures type safety for socket.io communications
export interface ClientToServerEvents {
  // room management actions
  createRoom: () => void; // request to create a new game room (player 1)
  joinRoom: (roomCode: string) => void; // request to join existing room with 6-character code (player 2)
  
  // game actions
  submitRestaurants: (restaurants: string[]) => void; // submit player's restaurant suggestions (minimum 3 required)
  makeChoice: (restaurantId: string, choice: Choice) => void; // submit vote (yes/neutral/no) for current restaurant card
}