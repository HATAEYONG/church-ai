/**
 * 목소리 설정 페이지
 *
 * AI 목소리를 선택하고 속도, 음조 등을 조절하는 페이지입니다.
 */

'use client';

import { useState, useEffect } from 'react';
import VoicePlayer from '@/components/VoicePlayer';

interface VoiceSettings {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  speakerBoost: boolean;
}

export default function VoiceSettingsPage() {
  const [settings, setSettings] = useState<VoiceSettings>({
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Rachel (기본)
    stability: 0.5,
    similarityBoost: 0.75,
    speakerBoost: true,
  });

  const [testText, setTestText] = useState('안녕하세요? 저는 당신의 AI 목소리입니다. 이 목소리가 마음에 드시나요?');

  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel (여성)', category: '영어', description: '따뜻하고 부드러운 목소리' },
    { id: 'azfTVEQ83m4HvnRuTWH4', name: 'Adam (남성)', category: '영어', description: '신뢰감 있는 목소리' },
    { id: 'pNHzzTJ4Yqdx81kZRK2E', name: 'Josh (남성)', category: '영어', description: '명랑한 목소리' },
    { id: 'oWaQZz9yI6vtZluQEi7C', name: 'Liam (남성)', category: '영어', description: '차분하고 신중한 목소리' },
    { id: 'z7bW6YfZjh0M6w3V0U7C', name: 'Emily (여성)', category: '영어', description: '밝고 친근한 목소리' },
    { id: 'mQo5KP8h4G0v2JjN0Z9C', name: 'Daniel (남성)', category: '영어', description: '전문적인 내레이션' },
  ];

  const handleVoiceChange = (voiceId: string) => {
    setSettings({ ...settings, voiceId });
  };

  const handleStabilityChange = (value: number) => {
    setSettings({ ...settings, stability: value });
  };

  const handleSimilarityBoostChange = (value: number) => {
    setSettings({ ...settings, similarityBoost: value });
  };

  const handleSpeakerBoostToggle = () => {
    setSettings({ ...settings, speakerBoost: !settings.speakerBoost });
  };

  const handleSave = () => {
    // localStorage에 설정 저장
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
    alert('목소리 설정이 저장되었습니다!');
  };

  const handleReset = () => {
    setSettings({
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      stability: 0.5,
      similarityBoost: 0.75,
      speakerBoost: true,
    });
  };

  useEffect(() => {
    // localStorage에서 설정 불러오기
    const savedSettings = localStorage.getItem('voiceSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('설정 불러오기 실패:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ⚙️ 목소리 설정
          </h1>
          <p className="text-lg text-gray-600">
            원하는 목소리와 속도, 음조를 설정하세요
          </p>
        </div>

        {/* 목소리 선택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎙️ 목소리 선택
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceChange(voice.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  settings.voiceId === voice.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{voice.name}</div>
                    <div className="text-sm text-gray-500">{voice.category}</div>
                  </div>
                  {settings.voiceId === voice.id && (
                    <span className="text-2xl">✓</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{voice.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 음성 설정 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎛️ 음성 세부 설정
          </h2>

          {/* 안정성 (Stability) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              안정성 (Stability): {(settings.stability * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.stability}
              onChange={(e) => handleStabilityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              낮을수록 더 표현력이 풍부하고, 높을수록 더 안정적입니다
            </p>
          </div>

          {/* 유사성 부스트 (Similarity Boost) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유사성 부스트 (Similarity Boost): {(settings.similarityBoost * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.similarityBoost}
              onChange={(e) => handleSimilarityBoostChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              목소리의 원래 특성을 얼마나 유지할지 설정합니다
            </p>
          </div>

          {/* 스피커 부스트 (Speaker Boost) */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.speakerBoost}
                onChange={handleSpeakerBoostToggle}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                스피커 부스트 (Speaker Boost)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              목소리의 클라리티를 강화합니다
            </p>
          </div>
        </div>

        {/* 테스트 영역 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎧 테스트
          </h2>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="테스트할 텍스트를 입력하세요..."
            className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none mb-4"
          />
          <VoicePlayer text={testText} label="🎙️ 테스트 재생" />
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            💾 설정 저장
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            🔄 초기화
          </button>
        </div>

        {/* 다른 페이지로 이동 */}
        <div className="mt-8 text-center">
          <a
            href="/voice"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← 음성 기능 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
