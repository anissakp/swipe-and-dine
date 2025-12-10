export interface Restaurant {
    id: string;
    name: string;
}
export type Choice = "YES" | "NEUTRAL" | "NO";
export interface MatchResult {
    restaurant: Restaurant;
    match: boolean;
}
export interface ServerToClientEvents {
    roomCreated: (roomCode: string) => void;
    playerJoined: (playerCount: number) => void;
    gameStart: (restaurants: Restaurant[]) => void;
    showCard: (restaurant: Restaurant, index: number, total: number) => void;
    waitingForOther: () => void;
    newRound: (roundNumber: number, restaurants: Restaurant[]) => void;
    gameEnd: (matches: Restaurant[], neutrals: Restaurant[]) => void;
    error: (message: string) => void;
}
export interface ClientToServerEvents {
    createRoom: () => void;
    joinRoom: (roomCode: string) => void;
    submitRestaurants: (restaurants: string[]) => void;
    makeChoice: (restaurantId: string, choice: Choice) => void;
}
//# sourceMappingURL=index.d.ts.map