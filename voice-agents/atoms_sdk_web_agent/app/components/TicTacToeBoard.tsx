import { motion } from "framer-motion";
import { useEffect } from "react";

interface TicTacToeBoardProps {
    board: string[];
    status: 'in_progress' | 'x_wins' | 'o_wins' | 'draw';
    winner: 'X' | 'O' | null;
}

export function TicTacToeBoard({ board, status, winner }: TicTacToeBoardProps) {

    const getStatusText = () => {
        if (status === 'in_progress') return "Your Turn (Say 'Top Left', 'Middle', etc.)";
        if (status === 'draw') return "It's a Draw!";
        if (winner === 'X') return "You Win!";
        return "AI Wins!";
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-xs font-bold mb-4 text-white">{getStatusText()}</h3>

            <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-xl">
                {board.map((cell, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-lg cursor-default
              ${cell === 'X' ? 'bg-blue-500/20 text-blue-400' :
                                cell === 'O' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-gray-700/50 hover:bg-gray-700'}`}
                    >
                        {cell}
                    </motion.div>
                ))}
            </div>

            {status !== 'in_progress' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm text-gray-400"
                >
                    Result: {status.replace('_', ' ').toUpperCase()}
                </motion.div>
            )}
        </div>
    );
}
