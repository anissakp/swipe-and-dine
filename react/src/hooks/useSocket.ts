import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Restaurant,
  Choice,
  MatchResult,
} from "../shared/types";

const SOCKET_URL = "http://localhost:3001";

export interface GameState {
  roomCode: string | null;
  playerCount: number;
  restaurants: Restaurant[];
  currentCard: Restaurant | null;
  cardIndex: number;
  totalCards: number;
  isWaiting: boolean;
  lastResult: MatchResult | null;
  matches: Restaurant[];
  neutrals: Restaurant[];
  gamePhase: "idle" | "waiting" | "input" | "playing" | "ended";
  error: string | null;
}

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

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

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("roomCreated", (roomCode: string) => {
      console.log(`Room created: ${roomCode}`);
      setGameState((prev) => ({
        ...prev,
        roomCode,
        gamePhase: "waiting",
      }));
    });

    socket.on("playerJoined", (playerCount: number) => {
      console.log(`Player count: ${playerCount}`);
      setGameState((prev) => ({
        ...prev,
        playerCount,
        gamePhase: playerCount === 2 ? "input" : "waiting",
      }));
    });

    socket.on("gameStart", (restaurants: Restaurant[]) => {
      console.log(`Game starting with ${restaurants.length} restaurants:`);
      restaurants.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}`));
      setGameState((prev) => ({
        ...prev,
        restaurants,
        gamePhase: "playing",
      }));
    });

    socket.on("showCard", (restaurant: Restaurant, cardIndex: number, totalCards: number) => {
      console.log(`Showing card ${cardIndex + 1}/${totalCards}: ${restaurant.name}`);
      setGameState((prev) => ({
        ...prev,
        currentCard: restaurant,
        cardIndex,
        totalCards,
        isWaiting: false,
        lastResult: null,
      }));
    });

    socket.on("waitingForOther", () => {
      console.log("Waiting for other player to finish...");
      setGameState((prev) => ({
        ...prev,
        isWaiting: true,
      }));
    });

    socket.on("gameEnd", (matches: Restaurant[], neutrals: Restaurant[]) => {
      console.log(`Game ended. Matches: ${matches.length}, Neutrals: ${neutrals.length}`);
      setGameState((prev) => ({
        ...prev,
        matches,
        neutrals,
        gamePhase: "ended",
        currentCard: null,
      }));
    });

    socket.on("error", (message: string) => {
      console.error(`Error: ${message}`);
      setGameState((prev) => ({
        ...prev,
        error: message,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(() => {
    if (socketRef.current) {
      console.log("Creating new room...");
      socketRef.current.emit("createRoom");
    }
  }, []);

  const joinRoom = useCallback((roomCode: string) => {
    if (socketRef.current) {
      console.log(`Attempting to join room: ${roomCode}`);
      socketRef.current.emit("joinRoom", roomCode);
    }
  }, []);

  const submitRestaurants = useCallback((restaurants: string[]) => {
    if (socketRef.current) {
      console.log("Submitting restaurants:", restaurants);
      socketRef.current.emit("submitRestaurants", restaurants);
    }
  }, []);

  const makeChoice = useCallback((restaurantId: string, choice: Choice) => {
    if (socketRef.current) {
      console.log(`Making choice: ${choice} for restaurant ${restaurantId}`);
      socketRef.current.emit("makeChoice", restaurantId, choice);
    }
  }, []);

  const clearError = useCallback(() => {
    setGameState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    isConnected,
    gameState,
    createRoom,
    joinRoom,
    submitRestaurants,
    makeChoice,
    clearError,
  };
}