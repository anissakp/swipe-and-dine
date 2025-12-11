// index.ts
// source: Express.js web framework - https://expressjs.com/
// source: Socket.IO real-time communication library - https://socket.io/docs/v4/
// source: Node.js HTTP server module - https://nodejs.org/api/http.html

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

// initialize express app and wrap it with http server for socket.io compatibility
const app = express();
const httpServer = createServer(app);

// create socket.io server with typed events for type safety
// cors configured to allow connections from react dev server on port 3000
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// interface representing the complete state of a single game room
// each room holds two players who submit restaurants and make choices
interface GameRoom {
  players: string[];                           // array of socket IDs (max 2 players)
  restaurants: Restaurant[];                   // combined list of all submitted restaurants from both players
  playerDecks: Map<string, Restaurant[]>;      // each player gets their own shuffled deck of restaurants
  playerCardIndices: Map<string, number>;      // tracks each player's current position in their personal deck
  choices: Map<string, Map<string, Choice>>;   // nested map: restaurantId -> (playerId -> choice)
  matches: Restaurant[];                       // restaurants where both players voted YES
  neutrals: Restaurant[];                      // restaurants with at least one NEUTRAL vote and no NO votes
  submittedPlayers: Set<string>;               // socket IDs of players who have submitted their restaurant lists
  roundNumber: number;                         // current round number (starts at 1, increments for runoff rounds)
}

// in-memory storage for all active game rooms
// maps room code (6-character string) to GameRoom object
const rooms = new Map<string, GameRoom>();

// generates a random 6-character uppercase room code for new game rooms
// uses base36 encoding (0-9, a-z) then converts to uppercase
// example output: "A3F9K2"
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// source: Fisher-Yates shuffle algorithm - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// implements fisher-yates shuffle algorithm to randomize array order
// used to create different restaurant orderings for each player
// creates new array without mutating original
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// helper function to start a new round with given restaurants
// creates uniquely shuffled decks for each player to ensure different card orders
// clears previous round's choices and sends first card to each player
function startNewRound(
  room: GameRoom,
  restaurants: Restaurant[],
  roomCode: string,
  io: Server<ClientToServerEvents, ServerToClientEvents>
): void {
  room.restaurants = restaurants;
  // clear previous round's choices to start fresh voting
  room.choices.clear();

  // create a differently shuffled deck for each player
  // ensures players see restaurants in different orders
  room.players.forEach((playerId) => {
    const playerDeck = shuffleArray(restaurants);
    room.playerDecks.set(playerId, playerDeck);
    room.playerCardIndices.set(playerId, 0); // start at index 0 (first card)

    // log each player's shuffled order for debugging
    console.log(`\nPlayer ${playerId}'s shuffled order for round ${room.roundNumber}:`);
    playerDeck.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}`);
    });
  });

  // notify all players in room that a new round is starting
  // sends round number and restaurant list
  io.to(roomCode).emit("newRound", room.roundNumber, restaurants);

  // send each player their first card from their own shuffled deck
  room.players.forEach((playerId) => {
    const playerDeck = room.playerDecks.get(playerId)!;
    const playerSocket = io.sockets.sockets.get(playerId);
    if (playerSocket && playerDeck.length > 0) {
      playerSocket.emit("showCard", playerDeck[0], 0, playerDeck.length);
    }
  });
}

// main connection handler - runs for each new websocket connection
io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>): void => {
  console.log(`New connection: ${socket.id}`);

  // tracks which room this socket is currently in
  // null if player is not in any room yet
  let currentRoom: string | null = null;

  // create room event handler
  // player requests to create a new game room
  // generates unique room code, initializes game state, and sends code back to creator
  socket.on("createRoom", (): void => {
    const roomCode = generateRoomCode();

    // initialize empty game room with default state
    const room: GameRoom = {
      players: [socket.id],
      restaurants: [],
      playerDecks: new Map(),
      playerCardIndices: new Map(),
      choices: new Map(),
      matches: [],
      neutrals: [],
      submittedPlayers: new Set(),
      roundNumber: 1, // always start at round 1
    };

    // store room in memory and associate socket with it
    rooms.set(roomCode, room);
    currentRoom = roomCode;
    socket.join(roomCode); // join socket.io room for broadcasting

    console.log(`Room created: ${roomCode} by ${socket.id}`);
    socket.emit("roomCreated", roomCode);      // send room code back to creator
    socket.emit("playerJoined", 1);            // notify creator they're player 1
  });

  // join room event handler
  // player attempts to join an existing room using a 6-character code
  // validates room exists and has space before allowing join
  socket.on("joinRoom", (roomCode: string): void => {
    const room = rooms.get(roomCode);

    // validation: room must exist in memory
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    // validation: room must have space (max 2 players)
    if (room.players.length >= 2) {
      socket.emit("error", "Room is full");
      return;
    }

    // add player to room's player list
    room.players.push(socket.id);
    currentRoom = roomCode;
    socket.join(roomCode); // join socket.io room for broadcasting

    console.log(`Player ${socket.id} joined room ${roomCode}`);

    // notify joining player of current player count
    socket.emit("playerJoined", room.players.length);
    // notify existing player(s) that someone joined
    socket.broadcast.to(roomCode).emit("playerJoined", room.players.length);
  });

  // submit restaurants event handler
  // player submits their list of restaurant suggestions
  // when both players have submitted, game starts with combined shuffled list
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

    // log submitted restaurants for debugging purposes
    console.log(`Player ${socket.id} submitted these restaurants:`);
    restaurantNames.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });

    // convert restaurant names to restaurant objects with unique IDs
    // ID format: lowercase-name-timestamp-random for guaranteed uniqueness
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
      // remove duplicate restaurants using case-insensitive comparison
      // keeps the last occurrence of each restaurant name
      const uniqueRestaurants = Array.from(
        new Map(room.restaurants.map((r) => [r.name.toLowerCase(), r])).values()
      );

      // store the deduplicated master list
      room.restaurants = uniqueRestaurants;

      console.log(`\nGame starting with ${room.restaurants.length} unique restaurants:`);
      room.restaurants.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}`);
      });

      // notify all players in room that game is starting
      io.to(currentRoom).emit("gameStart", room.restaurants);

      // use helper function to start the first round
      startNewRound(room, uniqueRestaurants, currentRoom, io);
    } else {
      console.log(`Waiting for other player to submit...\n`);
    }
  });

  // make choice event handler
  // player submits their yes/neutral/no choice for a restaurant
  // tracks choices, advances player to next card in their personal deck
  // when both players finish all cards, calculates results or starts runoff round
  socket.on("makeChoice", (restaurantId: string, choice: Choice): void => {
    // validation: player must be in a room
    if (!currentRoom) {
      socket.emit("error", "Not in a room");
      return;
    }

    const room = rooms.get(currentRoom);
    if (!room) return;

    // prevent duplicate votes on same restaurant
    const existingChoices = room.choices.get(restaurantId);
    if (existingChoices && existingChoices.has(socket.id)) {
      console.log(`Player ${socket.id} already voted on ${restaurantId}, ignoring duplicate`);
      return;
    }

    console.log(`Player ${socket.id} chose ${choice} for restaurant ${restaurantId}`);

    // initialize choice map for this restaurant if it doesn't exist yet
    if (!room.choices.has(restaurantId)) {
      room.choices.set(restaurantId, new Map());
    }
    // store this player's choice for the restaurant
    room.choices.get(restaurantId)!.set(socket.id, choice);

    // get this player's specific deck and current index
    // each player has their own shuffled deck order
    const playerDeck = room.playerDecks.get(socket.id);
    const currentIndex = room.playerCardIndices.get(socket.id);

    if (!playerDeck || currentIndex === undefined) {
      console.error(`Player ${socket.id} deck not found!`);
      return;
    }

    // increment this player's card index to move to next card
    const nextIndex = currentIndex + 1;
    room.playerCardIndices.set(socket.id, nextIndex);

    console.log(`Player ${socket.id} has made ${nextIndex}/${playerDeck.length} choices`);

    // if player has more cards to rate, show the next one from their personal deck
    if (nextIndex < playerDeck.length) {
      socket.emit("showCard", playerDeck[nextIndex], nextIndex, playerDeck.length);
    } else {
      // player has finished rating all cards in their deck
      console.log(`Player ${socket.id} finished all choices`);
      socket.emit("waitingForOther"); // tell player to wait for other player

      // check if all players have finished by comparing their index to their deck length
      const allPlayersDone = room.players.every((playerId) => {
        const playerIndex = room.playerCardIndices.get(playerId);
        const playerDeckSize = room.playerDecks.get(playerId)?.length || 0;
        return playerIndex === playerDeckSize;
      });

      // if both players done, calculate results
      if (allPlayersDone) {
        console.log("Both players done! Calculating results...");

        // analyze each restaurant's choices to determine matches and neutrals
        room.restaurants.forEach((restaurant) => {
          const restaurantChoices = room.choices.get(restaurant.id);

          // only process restaurants where both players have voted
          if (restaurantChoices && restaurantChoices.size === 2) {
            const choices = Array.from(restaurantChoices.values());
            const bothYes = choices.every((c) => c === "YES");
            const hasNeutral = choices.some((c) => c === "NEUTRAL");

            // match: both players said YES - this is a winning restaurant
            if (bothYes) {
              console.log(`MATCH! Both said YES to ${restaurant.name}`);
              room.matches.push(restaurant);
            }
            // neutral: at least one NEUTRAL and no NO votes - fallback option
            else if (hasNeutral && !choices.some((c) => c === "NO")) {
              room.neutrals.push(restaurant);
            }
            // otherwise: at least one NO vote, restaurant is rejected
          }
        });

        console.log(`Round ${room.roundNumber} results: ${room.matches.length} matches, ${room.neutrals.length} neutrals`);

        // if multiple matches exist (2+), start a runoff round to narrow down options
        if (room.matches.length >= 2) {
          console.log(`Multiple matches found! Starting runoff round ${room.roundNumber + 1}...`);

          // increment round number for runoff
          room.roundNumber++;

          // use current matches as the restaurant list for next round
          const runoffRestaurants = [...room.matches];

          // clear matches and neutrals for fresh voting in new round
          room.matches = [];
          room.neutrals = [];

          // start a new round with just the matched restaurants
          startNewRound(room, runoffRestaurants, currentRoom, io);
        }
        // if 0 or 1 match, end the game and show final results
        else {
          console.log(`Final results: ${room.matches.length} matches, ${room.neutrals.length} neutrals`);
          // broadcast final results to all players in the room
          io.to(currentRoom).emit("gameEnd", room.matches, room.neutrals);
        }
      }
    }
  });

  // disconnect event handler
  // handles cleanup when a player disconnects (closes browser, loses connection, etc.)
  // removes player from room and deletes empty rooms to free memory
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

// start the http server on port 3001
// socket.io piggybacks on this http server
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:3001`);
});