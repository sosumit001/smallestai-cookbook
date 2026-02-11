import React, { useEffect, useState, useRef } from "react";

interface WaveAvatarProps {
    isSpeaking: boolean;
    isConnected: boolean;
    className?: string;
}

export const WaveAvatar: React.FC<WaveAvatarProps> = ({
    isSpeaking,
    isConnected,
    className = "",
}) => {
    const [audioLevel, setAudioLevel] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isSpeaking) {
            setAudioLevel(0);
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const updateAudioLevel = () => {
            // Simulate audio levels since we don't have direct stream access
            // Use a combination of sine waves to create a more organic "speaking" pattern
            const time = Date.now() / 150;
            const base = (Math.sin(time) + 1) / 2; // 0 to 1
            const variance = Math.random() * 0.3;

            const level = Math.min(base * 0.7 + variance + 0.2, 1);
            setAudioLevel(level);

            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isSpeaking]);

    const waveIntensity = isSpeaking ? audioLevel * 100 : 0;

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Animated wave rings - constrained within container */}
            {[1, 2, 3].map((ring) => (
                <div
                    key={ring}
                    className="absolute rounded-full border-2 border-white/30 pointer-events-none"
                    style={{
                        width: `${80 + (ring * 8)}%`,
                        height: `${80 + (ring * 8)}%`,
                        backgroundColor: 'rgba(127, 229, 184, 0.12)',
                        transform: `scale(${1 + (waveIntensity * 0.0002 * ring)})`,
                        opacity: isSpeaking ? 0.4 - (ring * 0.1) : 0,
                        transition: "transform 0.15s ease-out, opacity 0.2s ease-out",
                        animation: isSpeaking ? `pulse 2s ease-out ${ring * 0.3}s infinite` : 'none',
                    }}
                />
            ))}

            {/* Outer glow effect */}
            <div
                className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
                style={{
                    background: `radial-gradient(circle, rgba(127, 229, 184, 0.35), rgba(91, 197, 206, 0.18))`,
                    transform: `scale(${1.3 + (waveIntensity * 0.0005)})`,
                    opacity: isSpeaking ? 0.5 : 0.2,
                    transition: "transform 0.15s ease-out, opacity 0.2s ease-out",
                }}
            />

            {/* Main avatar container */}
            <div
                className={`relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 border-[3px] border-white/80 shadow-xl`}
                style={{
                    background: `linear-gradient(135deg, #7FE5B8 0%, #6DD5C3 50%, #5BC5CE 100%)`,
                    transform: `scale(${1 + (waveIntensity * 0.0003)})`,
                    transition: "transform 0.1s ease-out",
                }}
            >
                {/* Inner circle */}
                <div
                    className={`w-[88%] h-[88%] rounded-full transition-all duration-300`}
                    style={{
                        background: `linear-gradient(135deg, #6DD5C3 0%, #5BC5CE 100%)`,
                        boxShadow: isSpeaking
                            ? `0 0 ${20 + waveIntensity * 0.5}px rgba(127, 229, 184, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.2)`
                            : "0 0 12px rgba(127, 229, 184, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.15)",
                        transition: "box-shadow 0.15s ease-out",
                    }}
                />
            </div>
        </div>
    );
};
