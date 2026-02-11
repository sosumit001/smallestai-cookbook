import { NextResponse } from 'next/server';
import { getGame, getLatestGameId } from '@/app/lib/tictactoe-engine';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const latest = searchParams.get('latest');
    let gameId = searchParams.get('gameId');

    if (latest === 'true') {
        const latestId = getLatestGameId();
        if (latestId) {
            gameId = latestId;
        } else {
            return NextResponse.json(
                { error: 'No games started yet' },
                { status: 404 }
            );
        }
    }

    console.log(`[API] get-state request for gameId: ${gameId}`);

    if (!gameId) {
        return NextResponse.json(
            { error: 'gameId is required' },
            { status: 400 }
        );
    }

    const gameState = getGame(gameId);
    if (!gameState) {
        return NextResponse.json(
            { error: 'Game not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(gameState);
}
