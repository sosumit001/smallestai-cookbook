export type Player = 'X' | 'O';
export type GameStatus = 'in_progress' | 'x_wins' | 'o_wins' | 'draw';

export interface GameState {
    board: string[]; // 9 cells
    status: GameStatus;
    winner: Player | null;
    gameId: string;
}

// In-memory storage (reset on server restart)
const games: Record<string, GameState> = {};
let latestGameId: string | null = null;

export function saveGame(gameId: string, state: GameState) {
    games[gameId] = state;
    latestGameId = gameId; // Track latest for demo polling
}

export function getLatestGameId(): string | null {
    return latestGameId;
}

export function getGame(gameId: string): GameState | undefined {
    return games[gameId];
}

export function checkWinner(board: string[]): Player | 'Draw' | null {
    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, b, c] of winningLines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] as Player;
        }
    }

    if (board.every(cell => cell !== '')) {
        return 'Draw';
    }

    return null;
}

export function minimax(board: string[], depth: number, isMaximizing: boolean): number {
    const winner = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'Draw') return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

export function makeComputerMove(board: string[]): number {
    // 1. First move optimization (Center or Corner) to save computation
    const emptyCount = board.filter(c => c === '').length;
    if (emptyCount >= 8) {
        if (board[4] === '') return 4;
        return 0;
    }

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}
