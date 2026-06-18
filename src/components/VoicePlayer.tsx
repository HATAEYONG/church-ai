/**
 * 음성 재생 컴포넌트
 *
 * 텍스트를 음성으로 재생하는 컴포넌트입니다.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { playTTS } from '@/lib/elevenlabs';

interface VoicePlayerProps {
  text: string;
  label?: string;
  autoPlay?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

export default function VoicePlayer({
  text,
  label = '🎙️ 음성 듣기',
  autoPlay = false,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!text.trim()) {
      setError('텍스트가 없습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    onPlayStart?.();

    try {
      // 실제 재생이 시작되면 로딩 → 재생 상태로 전환
      await playTTS(text, undefined, () => {
        setIsLoading(false);
        setIsPlaying(true);
      });
      onPlayEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '음성 재생 실패';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
  }, [autoPlay, text]);

  return (
    <div className={`voice-player ${className}`}>
      <button
        onClick={handlePlay}
        disabled={isLoading || isPlaying}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          ${isLoading || isPlaying
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
          }
          ${error ? 'border-2 border-red-500' : ''}
        `}
        title={text}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>변환 중...</span>
          </span>
        ) : isPlaying ? (
          <span className="flex items-center gap-2">
            <span className="animate-pulse">🔊</span>
            <span>재생 중...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">{label}</span>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

/**
 * 간단한 음성 재생 버튼 (아이콘만)
 */
export function VoicePlayButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying || !text.trim()) return;

    setIsPlaying(true);
    try {
      await playTTS(text);
    } catch (error) {
      console.error('음성 재생 오류:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className="p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
      title="음성으로 듣기"
    >
      {isPlaying ? (
        <span className="animate-pulse">🔊</span>
      ) : (
        <span>🎙️</span>
      )}
    </button>
  );
}

/**
 * 텍스트와 함께 보여주는 음성 재생 컴포넌트
 */
export function VoiceCard({ text }: { text: string }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      <p className="text-gray-800 mb-3">{text}</p>
      <VoicePlayer text={text} label="🎙️ 음성 듣기" />
    </div>
  );
}
