import { NextResponse } from 'next/server';
import { getGame, saveGame, checkWinner, makeComputerMove } from '@/app/lib/tictactoe-engine';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("[API] make-move received body:", body);

        let { gameId, position } = body;

        // Validating input
        if (!gameId || typeof gameId !== 'string') {
            console.error("[API] Invalid gameId:", gameId);
            return NextResponse.json(
                { error: 'gameId is required' },
                { status: 400 }
            );
        }

        // Handle position as string or number
        if (typeof position === 'string') {
            position = parseInt(position, 10);
        }

        if (typeof position !== 'number' || isNaN(position) || position < 0 || position > 8) {
            console.error("[API] Invalid position:", position);
            return NextResponse.json(
                { error: 'position must be a number between 0 and 8' },
                { status: 400 }
            );
        }

        const gameState = getGame(gameId);
        if (!gameState) {
            console.error("[API] Game not found:", gameId);
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        if (gameState.status !== 'in_progress') {
            return NextResponse.json({
                ...gameState,
                message: `Game is already over. Winner: ${gameState.winner}`
            });
        }

        if (gameState.board[position] !== '') {
            return NextResponse.json(
                { error: 'Position already taken' },
                { status: 400 }
            );
        }

        // Player move (X)
        gameState.board[position] = 'X';

        // Check win
        const result = checkWinner(gameState.board);
        if (result) {
            gameState.status = result === 'Draw' ? 'draw' : 'x_wins';
            gameState.winner = result === 'Draw' ? null : 'X';
        } else {
            // Computer move (O)
            const computerMove = makeComputerMove(gameState.board);
            if (computerMove !== -1) {
                gameState.board[computerMove] = 'O';
                const cpuResult = checkWinner(gameState.board);
                if (cpuResult) {
                    gameState.status = cpuResult === 'Draw' ? 'draw' : 'o_wins';
                    gameState.winner = cpuResult === 'Draw' ? null : 'O';
                }
            }
        }

        saveGame(gameId, gameState);
        console.log(`[API] Move processed for ${gameId}. Status: ${gameState.status}`);

        return NextResponse.json({
            gameId,
            board: gameState.board,
            status: gameState.status,
            winner: gameState.winner,
            message: gameState.status === 'in_progress' ? 'Your turn' : `Game over! ${gameState.winner ? gameState.winner + ' wins!' : 'Draw!'}`
        });

    } catch (error) {
        console.error("[API] Error in make-move:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
