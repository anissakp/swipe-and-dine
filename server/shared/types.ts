export type Choice = "YES" | "NO" | "NEUTRAL";

export interface Restaurant {
  id: string;
  name: string;
}

export interface PlayerChoice {
  oderId: string;
  choice: Choice;
}

export interface MatchResult {
  restaurantId: string;
  restaurantName: string;
  isMatch: boolean;
}

export interface ServerToClientEvents {
  roomCreated: (roomCode: string) => void;
  playerJoined: (playerCount: number) => void;
  gameStart: (restaurants: Restaurant[]) => void;
  showCard: (restaurant: Restaurant, cardIndex: number, totalCards: number) => void;
  waitingForOther: () => void;
  // CHANGED: added newRound event for runoff rounds when multiple matches exist
  newRound: (roundNumber: number, restaurants: Restaurant[]) => void;
  cardResult: (result: MatchResult) => void;
  gameEnd: (matches: Restaurant[], neutrals: Restaurant[]) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  submitRestaurants: (restaurants: string[]) => void;
  makeChoice: (restaurantId: string, choice: Choice) => void;
}