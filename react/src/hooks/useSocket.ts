import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Restaurant,
  Choice,
  MatchResult,
} from "../shared/types";

// WebSocket server URL - must match the server's listening port
const SOCKET_URL = "http://localhost:3001";

/**
 * represents the complete client-side game state
 * this interface tracks everything needed to render the UI and manage game flow
 */
export interface GameState {
  roomCode: string | null;                                        // current room code (null if not in a room)
  playerCount: number;                                            // number of players in the room (0-2)
  restaurants: Restaurant[];                                      // full list of restaurants for the game
  currentCard: Restaurant | null;                                 // restaurant currently being displayed for choice
  cardIndex: number;                                              // index of current card (0-based)
  totalCards: number;                                             // total number of cards to go through
  isWaiting: boolean;                                             // true if player finished and waiting for other
  lastResult: MatchResult | null;                                 // result of last choice (currently unused)
  matches: Restaurant[];                                          // final list of matched restaurants (both YES)
  neutrals: Restaurant[];                                         // final list of neutral restaurants (fallback options)
  gamePhase: "idle" | "waiting" | "input" | "playing" | "ended";  // current phase of the game
  error: string | null;                                           // error message to display (null if no error)
}

/**
 * custom React hook that manages WebSocket connection and game state
 * encapsulates all Socket.IO logic and provides clean interface for components
 */
export function useSocket() {
  // useRef to persist socket instance across re-renders without triggering updates
  // this prevents socket from being recreated on every render
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // main game state - initialized with default "idle" values
  const [gameState, setGameState] = useState<GameState>({
    roomCode: null,
    playerCount: 0,
    restaurants: [],
    currentCard: null,
    cardIndex: 0,
    totalCards: 0,
    isWaiting: false,
    lastResult: null,
    matches: [],
    neutrals: [],
    gamePhase: "idle",
    error: null,
  });

  // separate state for connection status (used to enable/disable UI elements)
  const [isConnected, setIsConnected] = useState(false);

  /**
   * effect hook to establish and manage WebSocket connection
   * runs once on component mount, cleans up on unmount
   * sets up all event listeners for server-to-client communication
   */
  useEffect(() => {
    // create new Socket.IO connection with typed events
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL);
    socketRef.current = socket;

    // CONNECTION EVENTS
    // handle successful connection to server
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    // handle disconnection from server (network issues, server down, etc.)
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // ROOM MANAGEMENT EVENTS
    // server confirms room was created successfully
    socket.on("roomCreated", (roomCode: string) => {
      console.log(`Room created: ${roomCode}`);
      setGameState((prev) => ({
        ...prev,
        roomCode,
        gamePhase: "waiting", // Move to waiting phase for second player
      }));
    });

    // server notifies of player count change (someone joined/left)
    socket.on("playerJoined", (playerCount: number) => {
      console.log(`Player count: ${playerCount}`);
      setGameState((prev) => ({
        ...prev,
        playerCount,
        // automatically transition to input phase when 2 players are present
        gamePhase: playerCount === 2 ? "input" : "waiting",
      }));
    });

    // GAME FLOW EVENTS
    // server signals game is starting with the full restaurant list
    socket.on("gameStart", (restaurants: Restaurant[]) => {
      console.log(`Game starting with ${restaurants.length} restaurants:`);
      restaurants.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}`));
      setGameState((prev) => ({
        ...prev,
        restaurants,
        gamePhase: "playing", // transition to playing phase
      }));
    });

    // server sends the next restaurant card to display
    socket.on("showCard", (restaurant: Restaurant, cardIndex: number, totalCards: number) => {
      console.log(`Showing card ${cardIndex + 1}/${totalCards}: ${restaurant.name}`);
      setGameState((prev) => ({
        ...prev,
        currentCard: restaurant,
        cardIndex,
        totalCards,
        isWaiting: false,    // player is actively choosing
        lastResult: null,    // clear any previous result
      }));
    });

    // server indicates player has finished all cards but other player hasn't
    socket.on("waitingForOther", () => {
      console.log("Waiting for other player to finish...");
      setGameState((prev) => ({
        ...prev,
        isWaiting: true, // show waiting message in UI
      }));
    });

    // server sends final results when both players have finished
    socket.on("gameEnd", (matches: Restaurant[], neutrals: Restaurant[]) => {
      console.log(`Game ended. Matches: ${matches.length}, Neutrals: ${neutrals.length}`);
      setGameState((prev) => ({
        ...prev,
        matches,            // restaurants both said YES to
        neutrals,           // fallback options (neutral votes, no NOs)
        gamePhase: "ended", // transition to results screen
        currentCard: null,  // no more cards to show
      }));
    });

    // ERROR HANDLING
    // server sends error message (room not found, room full, etc.)
    socket.on("error", (message: string) => {
      console.error(`Error: ${message}`);
      setGameState((prev) => ({
        ...prev,
        error: message, // store error for display in UI
      }));
    });

    // cleanup function: disconnect socket when component unmounts
    // prevents memory leaks and zombie connections
    return () => {
      socket.disconnect();
    };
  }, []); // empty dependency array = run once on mount

  /**
   * creates a new game room
   * emits "createRoom" event to server
   * server will respond with "roomCreated" event
   */
  const createRoom = useCallback(() => {
    if (socketRef.current) {
      console.log("Creating new room...");
      socketRef.current.emit("createRoom");
    }
  }, []);

  /**
   * joins an existing game room
   * roomCode - the 6-character room code to join
   * emits "joinRoom" event to server
   * server will respond with "playerJoined" or "error" event
   */
  const joinRoom = useCallback((roomCode: string) => {
    if (socketRef.current) {
      console.log(`Attempting to join room: ${roomCode}`);
      socketRef.current.emit("joinRoom", roomCode);
    }
  }, []);

  /**
   * submits player's restaurant suggestions to the server
   * restaurants - array of restaurant name strings
   * emits "submitRestaurants" event to server
   * server will respond with "gameStart" when both players have submitted
   */
  const submitRestaurants = useCallback((restaurants: string[]) => {
    if (socketRef.current) {
      console.log("Submitting restaurants:", restaurants);
      socketRef.current.emit("submitRestaurants", restaurants);
    }
  }, []);

  /**
   * submits player's choice for the current restaurant
   * restaurantId - Unique ID of the restaurant being rated
   * choice - player's vote: "YES", "NEUTRAL", or "NO"
   * emits "makeChoice" event to server
   * server will respond with "showCard", "waitingForOther", or "gameEnd"
   */
  const makeChoice = useCallback((restaurantId: string, choice: Choice) => {
    if (socketRef.current) {
      console.log(`Making choice: ${choice} for restaurant ${restaurantId}`);
      socketRef.current.emit("makeChoice", restaurantId, choice);
    }
  }, []);

  /**
   * clears the current error message from game state
   * called when user dismisses error notification
   */
  const clearError = useCallback(() => {
    setGameState((prev) => ({ ...prev, error: null }));
  }, []);

  // return public interface for components to use
  return {
    isConnected,       // connection status for UI feedback
    gameState,         // complete game state for rendering
    createRoom,        // action: create new room
    joinRoom,          // action: join existing room
    submitRestaurants, // action: submit restaurant list
    makeChoice,        // action: vote on restaurant
    clearError,        // action: dismiss error message
  };
}