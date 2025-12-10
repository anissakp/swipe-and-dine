# Swipe & Dine

This project was completed as part of Carnegie Mellon University's 05-635: Programming Interactive Experiences course. The goal was to build a two-player web app that helps people decide where to eat together by matching their restaurant preferences in real time. 

## Game Flow
1. Idle Phase: Player 1 creates a room, Player 2 joins with the code
   - Open http://localhost:3000 in one browser tab and click "Create Room"
   - Note the 6-character room code (e.g., "X0QEMW")
   - Open http://localhost:3000 in another tab
   - Enter the room code and click "Join Room"
2. Waiting Phase: Both players see the room code and wait for the other to join
3. Input Phase: Both players submit 3+ restaurants
4. Playing Phase: Players independently swipe through all restaurants (10 seconds per card)
5. Results Phase: View matches and neutral options
6. Runoff Phase (if applicable): If 2+ matches, players vote again on just those matches

## Installation and Usage
Follow these steps to set up the project locally:

1. **Clone the Repository**
```bash
git clone https://github.com/anissakp/swipe-and-dine.git
cd swipe-and-dine
```

3. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install React Client Dependencies**
```bash
cd react
npm install
```

4. **Start the Socket.IO Server** (Terminal 1)
```bash
cd server
npm run dev
```
Server runs on http://localhost:3001

5. **Start the React Client** (Terminal 2)
```bash
cd react
npm start
```
Client runs on http://localhost:3000


## Structure
```
├── server/                   # Socket.IO server
│   ├── server/
│   │   └── index.ts          # Main server logic with game state management
│   ├── shared/
│   │   └── types.ts          # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── react/                    # React client application
│   ├── src/
│   │   ├── components/       # UI components for each game phase
│   │   │   ├── IdleScreen.tsx
│   │   │   ├── WaitingRoom.tsx
│   │   │   ├── RestaurantInput.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── ResultsScreen.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts  # Custom hook for WebSocket connection
│   │   ├── shared/
│   │   │   └── types.ts      # Shared TypeScript interfaces
│   │   └── App.tsx           # Main app component with phase routing
│   └── package.json
└── README.md
```

# Credits
Technologies and Libraries
- [Socket.IO](https://socket.io/) for real-time communication
- [Material-UI](https://mui.com/) for UI components
- [React](https://react.dev/) for frontend framework
- [Express](https://expressjs.com/) for backend server
