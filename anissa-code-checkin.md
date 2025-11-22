# Code Check-in: Swipe & Dine
https://github.com/anissakp/PIX-Final-Project

## What I Implemented

For this check-in, I implemented the synchronization logic. Specifically:
1. Players can create and join rooms using unique codes (e.g., "X0QEMW")
2. Both players submit restaurant suggestions; server merges, deduplicates, and shuffles them
3. Each player goes through all restaurant cards at their own pace without waiting for the other
4. Server compares both players' choices and determines:
   - Matches (both said "yes")
   - Neutrals (at least one "neutral", no "no")

To implement this: 
- Server (Node.js, Express, Socket.IO): Manages game state, tracks player choices using Maps, broadcasts results
- Client (React, TypeScript): Custom `useSocket` hook manages connection and game state

## How It Fits Into Final Project

This synchronization logic is the foundation of the entire Swipe & Dine app. The work I have left is:
- 10-second countdown timer per card (auto-assigns "neutral" on timeout)
- Styling with Tailwind CSS, shadcn/ui components, and card animations
- Confetti on matches, progress indicators
- Error handling, disconnect recovery, responsiveness 

The current implementation uses console.log for debugging and basic HTML buttons for input, which will be replaced with better UI components in the final version.

## Key Technical Challenges Solved

1. Ensuring both clients receive consistent game state
2. Allowing players to progress at different speeds without blocking
3. Server-side deduplication with case-insensitive matching

## Notes to Future Self

- The `submittedPlayers` Set was really helpful for tracking who submitted restaurants
- Using Maps for choice tracking (restaurantId → playerId → choice) made comparison easy
- Socket.IO rooms simplified broadcasting to specific game sessions
- Browser console logs are helpful for debugging (espcially the client-side state changes)
- Reconsider using Tailwind for styling

## Credits/Inspiration

- Referenced Socket.IO Documentation for room management and event handling
- Referenced React Hooks Documentation for understanding useRef and useCallback patterns
- Referenced class examples (lecture and homework) for Socket.io patterns
- Went to Office Hours and spoke to Lea about which direction she recommend I take for the check-in as well as the tech stack I will be using