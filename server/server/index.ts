// source: TypeScript documentation - https://www.typescriptlang.org/docs/

// represents a single restaurant in the game
// used to track restaurants throughout the voting process
export interface Restaurant {
  id: string; // unique identifier (format: "lowercase-name-timestamp-random")
  name: string; // display name of the restaurant (as entered by players)
}

// represents a player's voting choice for a restaurant
// three options allow for nuanced matching between players
export type Choice = "YES" | "NEUTRAL" | "NO";

// represents the result after both players vote on a restaurant
// used to communicate match outcomes between server and client
export interface MatchResult {
  restaurant: Restaurant; // the restaurant that was voted on
  match: boolean; // true if both players voted yes
}

// defines all events that the server can send to clients
// typed interface ensures type safety for socket.io communications
export interface ServerToClientEvents {
  // room management events
  roomCreated: (roomCode: string) => void; // sent after successful room creation with unique code
  playerJoined: (playerCount: number) => void; // sent when player count changes (someone joins/leaves)
  
  // game flow events
  gameStart: (restaurants: Restaurant[]) => void; // sent when both players submit restaurants, game begins
  showCard: (restaurant: Restaurant, index: number, total: number) => void; // sent to show next card to rate
  waitingForOther: () => void; // sent when player finishes but waiting for other player
  newRound: (roundNumber: number, restaurants: Restaurant[]) => void; // sent when runoff round starts with narrowed list
  gameEnd: (matches: Restaurant[], neutrals: Restaurant[]) => void; // sent with final results when game completes
  
  // error handling
  error: (message: string) => void; // sent when error occurs (room not found, room full, etc)
}

// defines all events that clients can send to the server
// typed interface ensures type safety for socket.io communications
export interface ClientToServerEvents {
  // room management actions
  createRoom: () => void; // request to create a new game room
  joinRoom: (roomCode: string) => void; // request to join existing room with code
  
  // game actions
  submitRestaurants: (restaurants: string[]) => void; // submit player's restaurant suggestions (min 3)
  makeChoice: (restaurantId: string, choice: Choice) => void; // submit vote (YES/NEUTRAL/NO) for a restaurant
}