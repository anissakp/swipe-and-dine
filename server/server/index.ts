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

// initialize Express app and wrap it with HTTP server for Socket.IO
const app = express();
const httpServer = createServer(app);

// create Socket.IO server with typed events for type safety
// CORS configured to allow connections from React dev server on port 3000
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/**
 * represents the complete state of a single game room
 * each room holds two players who submit restaurants and make choices
 */
interface GameRoom {
  players: string[];                           // array of socket IDs (max 2 players)
  restaurants: Restaurant[];                   // combined list of all submitted restaurants
  // CHANGED: added playerDecks to store separate shuffled deck for each player
  playerDecks: Map<string, Restaurant[]>;      // each player gets their own shuffled deck
  // CHANGED: added playerCardIndices to track each player's progress independently
  playerCardIndices: Map<string, number>;      // track each player's current position in their deck
  choices: Map<string, Map<string, Choice>>;   // restaurantId -> (playerId -> choice)
  matches: Restaurant[];                       // restaurants both players said YES to
  neutrals: Restaurant[];                      // restaurants with at least one NEUTRAL (no NO)
  submittedPlayers: Set<string>;               // socket IDs of players who've submitted restaurants
}

// in-memory storage for all active game rooms (roomCode -> GameRoom)
const rooms = new Map<string, GameRoom>();

/**
 * generates a random 6-character uppercase room code
 * example: "A3F9K2"
 */
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * fisher-yates shuffle algorithm to randomize array order
 * used to shuffle the combined restaurant list before game starts
 * @param array - array to shuffle
 * @returns new shuffled array (does not mutate original)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// main connection handler - runs for each new WebSocket connection
io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
  console.log(`New connection: ${socket.id}`);

  // track which room this socket is currently in (null if not in any room)
  let currentRoom: string | null = null;

  /**
   * CREATE ROOM EVENT
   * player requests to create a new game room
   * creates room, adds player as first participant, and sends back room code
   */
  socket.on("createRoom", (): void => {
    const roomCode = generateRoomCode();
    
    // initialize empty game room with default state
    const room: GameRoom = {
      players: [socket.id],
      restaurants: [],
      // CHANGED: initialize Maps for per-player deck tracking
      playerDecks: new Map(),
      playerCardIndices: new Map(),
      choices: new Map(),
      matches: [],
      neutrals: [],
      submittedPlayers: new Set(),
    };

    // store room in memory and associate socket with it
    rooms.set(roomCode, room);
    currentRoom = roomCode;
    socket.join(roomCode); // join Socket.IO room for broadcasting

    console.log(`Room created: ${roomCode} by ${socket.id}`);
    socket.emit("roomCreated", roomCode);      // send room code to creator
    socket.emit("playerJoined", 1);            // notify creator they're player 1
  });

  /**
   * JOIN ROOM EVENT
   * player attempts to join an existing room with a code
   * validates room exists and isn't full before allowing join
   */
  socket.on("joinRoom", (roomCode: string): void => {
    const room = rooms.get(roomCode);

    // validation: room must exist
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    // validation: room must have space (max 2 players)
    if (room.players.length >= 2) {
      socket.emit("error", "Room is full");
      return;
    }

    // add player to room
    room.players.push(socket.id);
    currentRoom = roomCode;
    socket.join(roomCode);

    console.log(`Player ${socket.id} joined room ${roomCode}`);
    
    // notify joining player of current player count
    socket.emit("playerJoined", room.players.length);
    // notify existing player(s) that someone joined
    socket.broadcast.to(roomCode).emit("playerJoined", room.players.length);
  });

  /**
   * SUBMIT RESTAURANTS EVENT
   * player submits their list of restaurant suggestions
   * when both players have submitted, game starts with shuffled combined list
   */
  socket.on("submitRestaurants", (restaurantNames: string[]): void => {
    // validation: player must be in a room
    if (!currentRoom) {
      socket.emit("error", "Not in a room");
      return;
    }

    const room = rooms.get(currentRoom);
    if (!room) return;

    // prevent duplicate submissions from same player
    if (room.submittedPlayers.has(socket.id)) {
      console.log(`Player ${socket.id} already submitted`);
      return;
    }

    // log submitted restaurants for debugging
    console.log(`Player ${socket.id} submitted these restaurants:`);
    restaurantNames.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });

    // convert restaurant names to Restaurant objects with unique IDs
    // ID format: lowercase-name-timestamp-random for uniqueness
    restaurantNames.forEach((name) => {
      const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${Math.random()}`;
      room.restaurants.push({ id, name });
    });

    // mark this player as having submitted
    room.submittedPlayers.add(socket.id);
    console.log(`Total players submitted: ${room.submittedPlayers.size}/2`);
    console.log(`Total restaurants so far: ${room.restaurants.length}`);

    // check if both players have submitted - if so, start the game
    if (room.submittedPlayers.size === 2) {
      // remove duplicate restaurants (case-insensitive comparison)
      // keeps the last occurrence of each restaurant name
      const uniqueRestaurants = Array.from(
        new Map(room.restaurants.map((r) => [r.name.toLowerCase(), r])).values()
      );
      
      // store the master list
      room.restaurants = uniqueRestaurants;

      console.log(`\nGame starting with ${room.restaurants.length} unique restaurants:`);
      room.restaurants.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}`);
      });

      // CHANGED: create a differently shuffled deck for EACH player instead of one shared deck
      room.players.forEach((playerId) => {
        const playerDeck = shuffleArray(uniqueRestaurants);
        room.playerDecks.set(playerId, playerDeck);
        room.playerCardIndices.set(playerId, 0); // start at index 0
        
        console.log(`\nPlayer ${playerId}'s shuffled order:`);
        playerDeck.forEach((r, i) => {
          console.log(`  ${i + 1}. ${r.name}`);
        });
      });

      // notify all players in room that game is starting
      io.to(currentRoom).emit("gameStart", room.restaurants);

      // CHANGED: send each player their FIRST card from their own shuffled deck
      room.players.forEach((playerId) => {
        const playerDeck = room.playerDecks.get(playerId)!;
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket && playerDeck.length > 0) {
          playerSocket.emit("showCard", playerDeck[0], 0, playerDeck.length);
        }
      });
    } else {
      console.log(`Waiting for other player to submit...\n`);
    }
  });

  /**
   * MAKE CHOICE EVENT
   * player submits their YES/NEUTRAL/NO choice for a restaurant
   * tracks choices and advances player to next card
   * when both players finish all cards, calculates and broadcasts results
   */
  socket.on("makeChoice", (restaurantId: string, choice: Choice): void => {
    // validation: player must be in a room
    if (!currentRoom) {
      socket.emit("error", "Not in a room");
      return;
    }

    const room = rooms.get(currentRoom);
    if (!room) return;

    console.log(`Player ${socket.id} chose ${choice} for restaurant ${restaurantId}`);

    // initialize choice map for this restaurant if it doesn't exist
    if (!room.choices.has(restaurantId)) {
      room.choices.set(restaurantId, new Map());
    }
    // store this player's choice for the restaurant
    room.choices.get(restaurantId)!.set(socket.id, choice);

    // CHANGED: get this player's specific deck and current index instead of shared index
    const playerDeck = room.playerDecks.get(socket.id);
    const currentIndex = room.playerCardIndices.get(socket.id);

    if (!playerDeck || currentIndex === undefined) {
      console.error(`Player ${socket.id} deck not found!`);
      return;
    }

    // CHANGED: increment this player's card index (not a shared index)
    const nextIndex = currentIndex + 1;
    room.playerCardIndices.set(socket.id, nextIndex);

    console.log(`Player ${socket.id} has made ${nextIndex}/${playerDeck.length} choices`);

    // CHANGED: if player has more cards to rate, show the next one from THEIR deck
    if (nextIndex < playerDeck.length) {
      socket.emit("showCard", playerDeck[nextIndex], nextIndex, playerDeck.length);
    } else {
      // player has finished all cards
      console.log(`Player ${socket.id} finished all choices`);
      socket.emit("waitingForOther"); // tell player to wait

      // CHANGED: check if ALL players have finished by comparing their index to their deck length
      const allPlayersDone = room.players.every((playerId) => {
        const playerIndex = room.playerCardIndices.get(playerId);
        const playerDeckSize = room.playerDecks.get(playerId)?.length || 0;
        return playerIndex === playerDeckSize;
      });

      // if both players done, calculate final results
      if (allPlayersDone) {
        console.log("Both players done! Calculating results...");

        // analyze each restaurant's choices to determine matches
        room.restaurants.forEach((restaurant) => {
          const restaurantChoices = room.choices.get(restaurant.id);
          
          // only process if both players have made a choice
          if (restaurantChoices && restaurantChoices.size === 2) {
            const choices = Array.from(restaurantChoices.values());
            const bothYes = choices.every((c) => c === "YES");
            const hasNeutral = choices.some((c) => c === "NEUTRAL");

            // MATCH: both players said YES
            if (bothYes) {
              console.log(`MATCH! Both said YES to ${restaurant.name}`);
              room.matches.push(restaurant);
            } 
            // NEUTRAL: at least one NEUTRAL and no NO votes (fallback option)
            else if (hasNeutral && !choices.some((c) => c === "NO")) {
              room.neutrals.push(restaurant);
            }
            // otherwise: at least one NO, restaurant is rejected
          }
        });

        console.log(`Final results: ${room.matches.length} matches, ${room.neutrals.length} neutrals`);
        
        // broadcast final results to all players in the room
        io.to(currentRoom).emit("gameEnd", room.matches, room.neutrals);
      }
    }
  });

  /**
   * DISCONNECT EVENT
   * handles cleanup when a player disconnects
   * removes player from room and deletes empty rooms
   */
  socket.on("disconnect", (): void => {
    console.log(`Player disconnected: ${socket.id}`);
    
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        // remove disconnected player from room's player list
        room.players = room.players.filter((id) => id !== socket.id);
        
        // clean up empty rooms to free memory
        if (room.players.length === 0) {
          rooms.delete(currentRoom);
          console.log(`Room ${currentRoom} deleted (empty)`);
        }
      }
    }
  });
});

// start the server on port 3001
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});