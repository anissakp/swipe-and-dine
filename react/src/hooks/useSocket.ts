// useSocket.ts
// source: React hooks documentation - https://react.dev/reference/react
// source: Socket.IO client library - https://socket.io/docs/v4/client-api/

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Restaurant,
  Choice,
  MatchResult,
} from "../shared/types";

// websocket server URL - must match the server's listening port
// points to backend server running on localhost:3001
const SOCKET_URL = "http://localhost:3001";

// represents the complete client-side game state
// this interface tracks everything needed to render the UI and manage game flow
export interface GameState {
  roomCode: string | null; // current room code (null if not in a room)
  playerCount: number; // number of players in the room (0-2)
  restaurants: Restaurant[]; // full list of restaurants for the current round
  currentCard: Restaurant | null; // restaurant currently being displayed for choice
  cardIndex: number; // index of current card in player's personal deck (0-based)
  totalCards: number; // total number of cards in player's deck for current round
  isWaiting: boolean; // true if player finished rating and waiting for other player
  lastResult: MatchResult | null; // result of last choice (currently unused, reserved for future features)
  matches: Restaurant[]; // final list of matched restaurants (both players voted YES)
  neutrals: Restaurant[]; // final list of neutral restaurants (fallback/compromise options)
  gamePhase: "idle" | "waiting" | "input" | "playing" | "ended"; // current phase of the game flow
  error: string | null; // error message to display (null if no error)
  roundNumber: number; // current round number (1 = initial round, 2+ = runoff rounds)
}

// custom react hook that manages websocket connection and game state
// handles all socket.io events and provides actions for components to use
// returns connection status, game state, and action functions
export function useSocket() {
  // useRef to persist socket instance across re-renders without triggering updates
  // prevents socket from being recreated on every render, which would cause reconnection issues :(
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // main game state - initialized with default "idle" values
  // updates trigger component re-renders
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
    roundNumber: 1, // always start at round 1
  });

  // separate state for connection status to allow independent updates
  // displayed in UI to show if websocket is connected to server
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // effect hook to establish and manage websocket connection
  // runs once on component mount, cleans up on unmount
  // sets up all event listeners for server-to-client communication
  useEffect(() => {
    // create new socket.io connection with typed events for type safety
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL);
    socketRef.current = socket;

    // connection event: handle successful connection to server
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    // disconnect event: handle disconnection from server
    // triggers on network issues, server shutdown, or manual disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // room created event: server confirms room was created successfully
    // provides unique room code that needs to be shared with second player
    socket.on("roomCreated", (roomCode: string) => {
      console.log(`Room created: ${roomCode}`);
      setGameState((prev) => ({
        ...prev,
        roomCode,
        gamePhase: "waiting", // move to waiting phase for second player to join
      }));
    });

    // player joined event: server notifies of player count change
    // triggers when someone joins or leaves the room
    socket.on("playerJoined", (playerCount: number) => {
      console.log(`Player count: ${playerCount}`);
      setGameState((prev) => ({
        ...prev,
        playerCount,
        // automatically transition to input phase when 2 players are present
        gamePhase: playerCount === 2 ? "input" : "waiting",
      }));
    });

    // game start event: server signals game is starting with the full restaurant list
    // sent after both players have submitted their restaurant suggestions
    socket.on("gameStart", (restaurants: Restaurant[]) => {
      console.log(`Game starting with ${restaurants.length} restaurants:`);
      restaurants.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}`));
      setGameState((prev) => ({
        ...prev,
        restaurants,
        gamePhase: "playing", // transition to playing phase where players rate restaurants
      }));
    });

    // show card event: server sends the next restaurant card to display
    // includes card index and total for progress tracking
    socket.on("showCard", (restaurant: Restaurant, cardIndex: number, totalCards: number) => {
      console.log(`Showing card ${cardIndex + 1}/${totalCards}: ${restaurant.name}`);
      setGameState((prev) => ({
        ...prev,
        currentCard: restaurant,
        cardIndex,
        totalCards,
        isWaiting: false, // player is actively choosing, not waiting
        lastResult: null, // clear any of the previous results
      }));
    });

    // waiting for other event: indicates player has finished all cards but other player hasn't
    // player enters waiting state until other player completes their ratings
    socket.on("waitingForOther", () => {
      console.log("Waiting for other player to finish...");
      setGameState((prev) => ({
        ...prev,
        isWaiting: true, // show waiting message in the UI
      }));
    });

    // new round event: server signals a new round is starting (runoff round)
    // happens when multiple matches were found in previous round
    // provides updated round number and narrowed restaurant list
    socket.on("newRound", (roundNumber: number, restaurants: Restaurant[]) => {
      console.log(`Starting round ${roundNumber} with ${restaurants.length} restaurants`);
      setGameState((prev) => ({
        ...prev,
        roundNumber,
        restaurants,
        currentCard: null,
        isWaiting: false,
        gamePhase: "playing", // stay in playing phase for new round of voting
      }));
    });

    // game end event: server sends final results when both players have finished
    // includes matches (both YES) and neutrals (compromise options)
    socket.on("gameEnd", (matches: Restaurant[], neutrals: Restaurant[]) => {
      console.log(`Game ended. Matches: ${matches.length}, Neutrals: ${neutrals.length}`);
      setGameState((prev) => ({
        ...prev,
        matches, // restaurants both players voted YES to
        neutrals, // fallback options (neutral votes with no NOs)
        gamePhase: "ended", // transition to results screen
        currentCard: null, // no more cards to show
      }));
    });

    // error event: server sends error message for display
    // common errors: room not found, room full, not in a room
    socket.on("error", (message: string) => {
      console.error(`Error: ${message}`);
      setGameState((prev) => ({
        ...prev,
        error: message, // store error for display in UI
      }));
    });

    // cleanup function: disconnect socket when component unmounts
    // prevents memory leaks and zombie connections
    // critical for proper resource management
    return () => {
      socket.disconnect();
    };
  }, []); // empty dependency array = run once on mount, cleanup on unmount

  // creates a new game room
  // emits "createRoom" event to server
  // server will respond with "roomCreated" event containing unique room code
  const createRoom = useCallback(() => {
    if (socketRef.current) {
      console.log("Creating new room...");
      socketRef.current.emit("createRoom");
    }
  }, []);

  // joins an existing game room using a 6-character room code
  // emits "joinRoom" event to server with room code
  // server will respond with "playerJoined" event or "error" if room doesn't exist/is full
  const joinRoom = useCallback((roomCode: string) => {
    if (socketRef.current) {
      console.log(`Attempting to join room: ${roomCode}`);
      socketRef.current.emit("joinRoom", roomCode);
    }
  }, []);

  // submits player's restaurant suggestions to the server
  // emits "submitRestaurants" event with array of restaurant names
  // when both players submit, server starts the game
  const submitRestaurants = useCallback((restaurants: string[]) => {
    if (socketRef.current) {
      console.log("Submitting restaurants:", restaurants);
      socketRef.current.emit("submitRestaurants", restaurants);
    }
  }, []);

  // submits player's choice (yes/neutral/no) for the current restaurant
  // emits "makeChoice" event with restaurant ID and choice
  // server will respond with next card or waiting/end game message
  const makeChoice = useCallback((restaurantId: string, choice: Choice) => {
    if (socketRef.current) {
      console.log(`Making choice: ${choice} for restaurant ${restaurantId}`);
      socketRef.current.emit("makeChoice", restaurantId, choice);
    }
  }, []);

  // clears the current error message from game state
  // called when user dismisses error notification in UI
  const clearError = useCallback(() => {
    setGameState((prev) => ({ ...prev, error: null }));
  }, []);

  // return public interface for components to use
  // provides read-only state and action functions
  return {
    isConnected, // connection status for UI feedback (connected/disconnected indicator)
    gameState, // complete game state for rendering appropriate screens
    createRoom, // action: create new room (player 1)
    joinRoom, // action: join existing room (player 2)
    submitRestaurants, // action: submit restaurant list (both players)
    makeChoice, // action: vote on restaurant (yes/neutral/no)
    clearError, // action: dismiss error message
  };
}