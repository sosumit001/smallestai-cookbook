import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveGame } from '@/app/lib/tictactoe-engine';

export async function POST(req: Request) {
    console.log("[API] new-game request received");
    try {
        const gameId = uuidv4();
        const initialState = {
            board: ['', '', '', '', '', '', '', '', ''],
            status: 'in_progress' as const,
            winner: null,
            gameId: gameId
        };

        saveGame(gameId, initialState);
        console.log(`[API] Created new game: ${gameId}`);

        return NextResponse.json({
            gameId,
            board: initialState.board,
            status: initialState.status,
            message: "New game started! You are X. Speak your move (e.g., 'top left', 'middle center')."
        });
    } catch (error) {
        console.error("Error creating new game:", error);
        return NextResponse.json(
            { error: 'Failed to create game' },
            { status: 500 }
        );
    }
}
