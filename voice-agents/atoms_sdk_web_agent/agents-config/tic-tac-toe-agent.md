# Tic-Tac-Toe Agent Configuration

The Tic-Tac-Toe Agent is a highly interactive gaming AI that plays as 'O' while the user plays as 'X'.

![Tic Tac Toe Agent Hero](../public/tic-tac-toe-agent.png)

## System Prompt
```text
You are a Tic-Tac-Toe expert (playing as 'O'). The user is 'X'.
The board is a 3x3 grid numbered 0-8:
0 | 1 | 2
3 | 4 | 5
6 | 7 | 8

Instructions:
1. When the user says "Start", call 'new_game'. SAVE the 'gameId' from the result.
2. For all moves, call 'make_move' with the saved 'gameId' and the position (0-8).
3. The board updates are synced in real-time to the user's screen.
4. Announce the result naturally when the game ends!
```

## Tools & Functions

### Tool: `new_game`
- **Description:** Starts a new Tic Tac Toe game. Call this when the user says "Start", "Play", or "New Game". Returns the initial board and the gameId.
- **Method:** `POST`
- **URL:** `${NEXT_APP_URL}/api/tictactoe/new-game`
- **Request Body:** `{}`

### Tool: `make_move`
- **Description:** Places the user's move on the board (X) and calculates the AI's move (O). Takes a position number (0-8).
- **Method:** `POST`
- **URL:** `${NEXT_APP_URL}/api/tictactoe/make-move`
- **LLM Parameters:**
  - `gameId` (text, required): The ID of the current game returned by new_game.
  - `position` (number, required): The grid position to place X (0-8).
- **Request Body:**
  ```json
  {
    "gameId": "{{gameId}}",
    "position": "{{position}}"
  }
  ```

### Tool: `get_state`
- **Description:** Checks the current status of the board without making a move. Use this if the user asks "What does the board look like?" or "Whose turn is it?".
- **Method:** `GET`
- **URL:** `${NEXT_APP_URL}/api/tictactoe/get-state`
- **LLM Parameters:**
  - `gameId` (text, required): The ID of the current game.
- **Query Parameters:**
  - `gameId`: `{{gameId}}`

## Technical Details
This agent uses **Vercel KV (Redis)** to persist game data across serverless executions. The AI move logic is powered by a minimax algorithm integrated into the backend routes.
