'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AtomsClient } from "atoms-client-sdk";
import { WaveAvatar } from "./components/WaveAvatar"; // Assuming this is kept
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, CloudSun, Newspaper, Headset, Sparkles, ChevronRight, Gamepad2 } from "lucide-react";
import { TicTacToeBoard } from "./components/TicTacToeBoard";
// Mock Agents Data
const AGENTS = [
  {
    id: 'weather-agent',
    name: 'Weather Agent',
    role: 'Forecast & Updates',
    description: 'Get real-time weather updates and forecasts.',
    color: 'from-blue-500 to-cyan-400',
    icon: CloudSun
  },
  {
    id: 'tictactoe-agent',
    name: 'Tic Tac Toe',
    role: 'Game Opponent',
    description: 'Play Tic Tac Toe with voice commands.',
    color: 'from-purple-500 to-pink-400',
    icon: Gamepad2
  },
  {
    id: 'hackernews-agent',
    name: 'Hacker News',
    role: 'Tech News curator',
    description: 'Get the latest tech news and trends.',
    color: 'from-orange-500 to-yellow-400',
    icon: Newspaper
  }
];

interface AtomsVoiceChatProps {
  onError?: (error: string) => void;
  onTranscript?: (text: string, data: unknown) => void;
}

export default function Home({
  onError,
  onTranscript,
}: AtomsVoiceChatProps) {
  // Client Init
  const client = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new AtomsClient();
    }
    return null as unknown as AtomsClient;
  }, []);

  // State
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [gameState, setGameState] = useState<{
    gameId: string | null;
    board: string[];
    status: 'in_progress' | 'x_wins' | 'o_wins' | 'draw';
    winner: 'X' | 'O' | null;
  } | null>(null);

  const mode = "webcall";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  const onTranscriptRef = useRef(onTranscript);

  // Sync refs
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const resetAllStates = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    setIsAgentTalking(false);
    setIsMuted(false);
    setStatus("");
    // Note: We don't nullify selectedAgent here to allow animation logic if needed,
    // but typically disconnecting goes back to home.
    setSelectedAgent(null);
  }, []);

  const forceReset = useCallback(() => {
    try {
      if (client) client.stopSession();
    } catch (e) { /* ignore */ }
    resetAllStates();
  }, [client, resetAllStates]);

  // Event Listeners
  const setupEventListeners = useCallback(() => {
    if (!client) return;
    client.removeAllListeners();

    client.on("session_started", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setStatus("Session started");
    });

    client.on("session_ended", resetAllStates);

    client.on("agent_speaking_started", () => {
      setIsAgentTalking(true);
    });

    client.on("agent_speaking_stopped", () => {
      setIsAgentTalking(false);
    });

    client.on("transcript", (data: { text: string }) => {
      onTranscriptRef.current?.(data.text, data);
    });

    client.on("error", (error: string) => {
      console.error("Client error:", error);
      onErrorRef.current?.(error);
      forceReset();
    });

    // Listen for function call results (for Tic Tac Toe game updates)
    client.on("function_call_result", (data: any) => {
      console.log("Function call result:", data);

      // Check if this is a Tic Tac Toe function
      if (data.function_name === 'make_move' || data.function_name === 'new_game') {
        try {
          const result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;

          setGameState({
            gameId: result.gameId || null,
            board: result.board || ['', '', '', '', '', '', '', '', ''],
            status: result.status || 'in_progress',
            winner: result.winner || null,
          });
        } catch (error) {
          console.error("Error parsing function result:", error);
        }
      }
    });
  }, [client, resetAllStates, forceReset]);

  // Polling for talking state AND Game State
  useEffect(() => {
    if (!isConnected || !client) return;

    // Talk state polling
    const interval = setInterval(() => {
      if (client.isAgentTalking !== isAgentTalking) {
        setIsAgentTalking(client.isAgentTalking);
      }
    }, 50);

    // Game state polling (only if tictactoe agent)
    let gameInterval: any;
    if (selectedAgent?.id === 'tictactoe-agent') {
      gameInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/tictactoe/get-state?latest=true');
          if (res.ok) {
            const data = await res.json();
            setGameState(data);
          }
        } catch (e) {
          // ignore errors during polling
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [isConnected, client, isAgentTalking, selectedAgent]);

  // Connect Logic
  const connect = async (agent: typeof AGENTS[0]) => {
    if (!client) return;
    setIsConnecting(true);

    // Setup before connecting
    setupEventListeners();

    try {
      // Fetch token - Using default agent ID from backend logic (works for all for demo)
      // or we could pass agent.id if backend handled it.
      const response = await fetch(`/api/invite-agent?mode=${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id }),
      });

      if (!response.ok) throw new Error("Failed to get token");
      const data = await response.json();

      await client.startSession({
        accessToken: data.data.token,
        mode: mode as any,
        host: data.data.host,
        emitRawAudioSamples: true,
      });

      if (mode === "webcall") {
        await client.startAudioPlayback();
      }

    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      setSelectedAgent(null); // Go back if failed
    }
  };

  const handleAgentSelect = (agent: typeof AGENTS[0]) => {
    setSelectedAgent(agent);
    // Auto start
    connect(agent);
  };

  const disconnect = () => {
    forceReset();
  };

  const toggleMute = () => {
    if (!client) return;
    if (isMuted) {
      client.unmute();
      setIsMuted(false);
    } else {
      client.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">

      <AnimatePresence mode="wait">
        {!selectedAgent ? (
          // HOME VIEW: Agent Grid
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-6 min-h-screen flex flex-col justify-center"
          >
            <div className="mb-16 text-center">
              <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Select Your AI Companion
              </h1>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                Choose an agent to start a real-time voice conversation.
                Experience the power of ultra-low latency interactions.
              </p>
            </div>

            <div className="flex justify-center">
              {AGENTS.map((agent) => (
                <motion.button
                  layoutId={`card-${agent.id}`}
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-left max-w-md w-full overflow-hidden"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-linear-to-br ${agent.color}`} />

                  <div className={`p-3 rounded-xl bg-linear-to-br ${agent.color} shadow-lg shrink-0`}>
                    <agent.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors truncate">
                      {agent.name}
                    </h3>
                    <p className="text-gray-500 text-xs truncate">
                      {agent.role}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          // ACTIVE CALL VIEW
          <motion.div
            key="active"
            className="fixed inset-0 flex flex-col"
          >
            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-end items-start z-50">
              {/* Agent Mini Card (Animated to top right) */}
              <motion.div
                layoutId={`card-${selectedAgent.id}`}
                className="flex items-center gap-4 p-2 pl-3 pr-6 rounded-full bg-gray-900/80 border border-gray-800 backdrop-blur-xl"
              >
                <div className={`p-2 rounded-full bg-linear-to-br ${selectedAgent.color}`}>
                  <selectedAgent.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm leading-tight text-white">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {isConnecting ? 'Connecting...' : 'Active Call'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* MAIN CONTENT CENTER */}
            <div className="flex-1 flex flex-col items-center justify-center relative -mt-16">

              {/* Layout Wrapper: Switches to row when game is active */}
              <div className={`flex items-center justify-center transition-all duration-500 ease-in-out ${selectedAgent?.id === 'tictactoe-agent' && (gameState?.board || (!gameState && !isConnecting))
                ? 'flex-col md:flex-row gap-12'
                : 'flex-col gap-0'
                }`}>

                {/* Avatar Section */}
                <div className="relative flex flex-col items-center">
                  {/* Status pulsing if connecting */}
                  {isConnecting && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-blue-500/20 blur-xl" />
                  )}

                  <WaveAvatar
                    isSpeaking={isAgentTalking}
                    isConnected={!isConnecting}
                    className="w-48 h-48 md:w-64 md:h-64"
                  />
                </div>

                {/* Tic Tac Toe Board Section */}
                {selectedAgent?.id === 'tictactoe-agent' && gameState && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-h-[400px] flex flex-col items-center gap-6 z-10"
                  >
                    <TicTacToeBoard
                      board={gameState.board}
                      status={gameState.status}
                      winner={gameState.winner}
                    />
                    {/* Debug/Manual Start Button */}
                    <button
                      onClick={async () => {
                        await fetch('/api/tictactoe/new-game', { method: 'POST' });
                      }}
                      className="text-xs text-gray-500 underline hover:text-white"
                    >
                      Force New Game
                    </button>
                  </motion.div>
                )}

                {/* Show Start Button if game not started but agent connected */}
                {selectedAgent?.id === 'tictactoe-agent' && (!gameState || !gameState.board) && !isConnecting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <button
                      onClick={async () => {
                        await fetch('/api/tictactoe/new-game', { method: 'POST' });
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white shadow-lg transition-all whitespace-nowrap"
                    >
                      Start Game Board
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Status Text - Centered below both */}
              {!isConnecting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center z-0"
                >
                  {/* Only show status if board isn't dominating the view, or make it smaller */}
                  <p className={`text-xl font-semibold transition-colors duration-300 ${isAgentTalking ? 'text-emerald-200' : 'text-gray-200'
                    }`}>
                    {isAgentTalking ? 'Speaking...' : 'Listening...'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {isAgentTalking ? 'Agent is responding' : 'Say something to continue'}
                  </p>
                </motion.div>
              )}

              {/* Connecting Text */}
              {isConnecting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-blue-400 font-medium animate-pulse"
                >
                  Establishing secure connection...
                </motion.div>
              )}

              {/* Floating Controls */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4"
              >
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all duration-300 shadow-2xl ${isMuted
                    ? 'bg-white text-gray-900 hover:bg-gray-200'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  onClick={disconnect}
                  className="p-4 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all shadow-2xl backdrop-blur-md"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </motion.div>

            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-tr ${selectedAgent.color} opacity-10 blur-[120px] rounded-full`} />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
