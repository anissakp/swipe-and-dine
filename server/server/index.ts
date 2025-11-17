import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Restaurant,
  Choice,
  MatchResult,
} from "../shared/types";

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

interface GameRoom {
  players: string[];
  restaurants: Restaurant[];
  currentCardIndex: number;
  choices: Map<string, Map<string, Choice>>;
  matches: Restaurant[];
  neutrals: Restaurant[];
  submittedPlayers: Set<string>;
}

const rooms = new Map<string, GameRoom>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
  console.log(`New connection: ${socket.id}`);

  let currentRoom: string | null = null;

  socket.on("createRoom", (): void => {
    const roomCode = generateRoomCode();
    const room: GameRoom = {
      players: [socket.id],
      restaurants: [],
      currentCardIndex: 0,
      choices: new Map(),
      matches: [],
      neutrals: [],
      submittedPlayers: new Set(),
    };

    rooms.set(roomCode, room);
    currentRoom = roomCode;
    socket.join(roomCode);

    console.log(`Room created: ${roomCode} by ${socket.id}`);
    socket.emit("roomCreated", roomCode);
    socket.emit("playerJoined", 1);
  });

  socket.on("joinRoom", (roomCode: string): void => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("error", "Room is full");
      return;
    }

    room.players.push(socket.id);
    currentRoom = roomCode;
    socket.join(roomCode);

    console.log(`Player ${socket.id} joined room ${roomCode}`);
    socket.emit("playerJoined", room.players.length);
    socket.broadcast.to(roomCode).emit("playerJoined", room.players.length);
  });

  socket.on("submitRestaurants", (restaurantNames: string[]): void => {
    if (!currentRoom) {
      socket.emit("error", "Not in a room");
      return;
    }

    const room = rooms.get(currentRoom);
    if (!room) return;

    if (room.submittedPlayers.has(socket.id)) {
      console.log(`Player ${socket.id} already submitted`);
      return;
    }

    console.log(`Player ${socket.id} submitted these restaurants:`);
    restaurantNames.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });

    restaurantNames.forEach((name) => {
      const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${Math.random()}`;
      room.restaurants.push({ id, name });
    });

    room.submittedPlayers.add(socket.id);
    console.log(`Total players submitted: ${room.submittedPlayers.size}/2`);
    console.log(`Total restaurants so far: ${room.restaurants.length}`);

    if (room.submittedPlayers.size === 2) {
      const uniqueRestaurants = Array.from(
        new Map(room.restaurants.map((r) => [r.name.toLowerCase(), r])).values()
      );
      room.restaurants = shuffleArray(uniqueRestaurants);

      console.log(`\nGame starting with ${room.restaurants.length} unique restaurants:`);
      room.restaurants.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}`);
      });

      io.to(currentRoom).emit("gameStart", room.restaurants);

      if (room.restaurants.length > 0) {
        io.to(currentRoom).emit("showCard", room.restaurants[0], 0, room.restaurants.length);
      }
    } else {
      console.log(`Waiting for other player to submit...\n`);
    }
  });

  socket.on("makeChoice", (restaurantId: string, choice: Choice): void => {
    if (!currentRoom) {
      socket.emit("error", "Not in a room");
      return;
    }

    const room = rooms.get(currentRoom);
    if (!room) return;

    console.log(`Player ${socket.id} chose ${choice} for restaurant ${restaurantId}`);

    if (!room.choices.has(restaurantId)) {
      room.choices.set(restaurantId, new Map());
    }
    room.choices.get(restaurantId)!.set(socket.id, choice);

    const playerChoiceCount = Array.from(room.choices.values()).filter(
      (choiceMap) => choiceMap.has(socket.id)
    ).length;

    console.log(`Player ${socket.id} has made ${playerChoiceCount}/${room.restaurants.length} choices`);

    if (playerChoiceCount < room.restaurants.length) {
      socket.emit("showCard", room.restaurants[playerChoiceCount], playerChoiceCount, room.restaurants.length);
    } else {
      console.log(`Player ${socket.id} finished all choices`);
      socket.emit("waitingForOther");

      const allPlayersDone = room.players.every((playerId) => {
        const count = Array.from(room.choices.values()).filter(
          (choiceMap) => choiceMap.has(playerId)
        ).length;
        return count === room.restaurants.length;
      });

      if (allPlayersDone) {
        console.log("Both players done! Calculating results...");

        room.restaurants.forEach((restaurant) => {
          const restaurantChoices = room.choices.get(restaurant.id);
          if (restaurantChoices && restaurantChoices.size === 2) {
            const choices = Array.from(restaurantChoices.values());
            const bothYes = choices.every((c) => c === "YES");
            const hasNeutral = choices.some((c) => c === "NEUTRAL");

            if (bothYes) {
              console.log(`MATCH! Both said YES to ${restaurant.name}`);
              room.matches.push(restaurant);
            } else if (hasNeutral && !choices.some((c) => c === "NO")) {
              room.neutrals.push(restaurant);
            }
          }
        });

        console.log(`Final results: ${room.matches.length} matches, ${room.neutrals.length} neutrals`);
        io.to(currentRoom).emit("gameEnd", room.matches, room.neutrals);
      }
    }
  });

  socket.on("disconnect", (): void => {
    console.log(`Player disconnected: ${socket.id}`);
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.players = room.players.filter((id) => id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(currentRoom);
          console.log(`Room ${currentRoom} deleted (empty)`);
        }
      }
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});