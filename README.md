# Swipe & Dine

This project was completed as part of Carnegie Mellon University's 05-635: Programming Interactive Experiences course. The goal was to build a two-player web app that helps people decide where to eat together by matching their restaurant preferences in real time. 

## Installation and Usage

Follow these steps to set up the project locally:

1. **Clone the Repository**
```bash
git clone https://github.com/anissakp/PIX-Final-Project.git
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

## Testing the Synchronization

1. Open http://localhost:3000 in one browser tab
2. Click "Create Room" and note the room code (e.g., "X0QEMW")
3. Open http://localhost:3000 in another tab
4. Enter the room code and click "Join"
5. Both players enter 3 different restaurant names each and submit
6. Each player makes YES/NO/NEUTRAL choices independently at their own pace
7. After both players finish, results display all matches (both YES) and neutrals

Watch the server terminal for console.log outputs showing player connections, room creation, restaurant submissions, individual choices, and final match calculations.

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
│   │   ├── hooks/
│   │   │   └── useSocket.ts  # Custom hook for socket connection
│   │   ├── shared/
│   │   │   └── types.ts      # Shared TypeScript interfaces
│   │   └── App.tsx           # Main UI with game phases
│   └── package.json
├── README.md
```
