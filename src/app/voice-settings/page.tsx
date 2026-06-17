/**
 * 목소리 설정 페이지 (단순화 버전)
 *
 * AI 목소리를 성별별로 간단히 선택합니다.
 */

'use client';

import { useState, useEffect } from 'react';
import VoicePlayer from '@/components/VoicePlayer';

interface VoiceSettings {
  voiceId: string;
  voiceType: 'male' | 'female' | 'custom';
  customVoices: Array<{ id: string; name: string }>;
}

export default function VoiceSettingsPage() {
  const [settings, setSettings] = useState<VoiceSettings>({
    voiceId: 'azfTVEQ83m4HvnRuTWH4', // Adam (남자1 - 기본)
    voiceType: 'male',
    customVoices: [],
  });

  const [testText, setTestText] = useState('안녕하세요? 저는 당신의 AI 목소리입니다. 이 목소리가 마음에 드시나요?');

  const defaultVoices = [
    {
      id: 'azfTVEQ83m4HvnRuTWH4',
      type: 'male',
      name: '남자1',
      description: '신뢰감 있는 남성 목소리'
    },
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      type: 'female',
      name: '여자1',
      description: '따뜻하고 부드러운 여성 목소리'
    },
  ];

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

    // 클로닝된 목소리 불러오기
    const clonedVoices = localStorage.getItem('clonedVoices');
    if (clonedVoices) {
      try {
        const voices = JSON.parse(clonedVoices);
        setSettings(prev => ({ ...prev, customVoices: voices }));
      } catch (error) {
        console.error('클로닝된 목소리 불러오기 실패:', error);
      }
    }
  }, []);

  const handleVoiceChange = (voiceId: string, type: 'male' | 'female' | 'custom') => {
    setSettings({ ...settings, voiceId, voiceType: type });
  };

  const handleSave = () => {
    // localStorage에 설정 저장
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
    alert('목소리 설정이 저장되었습니다!');
  };

  const handleReset = () => {
    setSettings({
      voiceId: 'azfTVEQ83m4HvnRuTWH4',
      voiceType: 'male',
      customVoices: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ⚙️ 목소리 설정
          </h1>
          <p className="text-lg text-gray-600">
            성별별 목소리를 간단하게 선택하세요
          </p>
        </div>

        {/* 기본 목소리 선택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎙️ 기본 목소리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceChange(voice.id, voice.type as 'male' | 'female')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  settings.voiceId === voice.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{voice.name}</div>
                    <div className="text-sm text-gray-500">{voice.description}</div>
                  </div>
                  {settings.voiceId === voice.id && (
                    <span className="text-3xl">✓</span>
                  )}
                </div>
                <div className="mt-4">
                  <VoicePlayer
                    text={testText}
                    label="🎧 테스트 듣기"
                    className="w-full"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 클로닝된 목소리 */}
        {settings.customVoices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🎤 내 목소리 ({settings.customVoices.length})
            </h2>
            <div className="space-y-3">
              {settings.customVoices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceChange(voice.id, 'custom')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    settings.voiceId === voice.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{voice.name}</div>
                      <div className="text-sm text-gray-500">클로닝된 목소리</div>
                    </div>
                    {settings.voiceId === voice.id && (
                      <span className="text-2xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
        <div className="flex gap-4 justify-center mb-8">
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

        {/* 보이스 클로닝 안내 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 목소리 클로닝
          </h3>
          <p className="text-blue-700 mb-4">
            나만의 목소리를 만들어보세요! 내 목소리로 AI가 읽어줍니다.
          </p>
          <a
            href="/voice-clone"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🎤 목소리 클로닝하러 가기
          </a>
        </div>

        {/* 다른 페이지로 이동 */}
        <div className="mt-8 text-center">
          <a
            href="/voice"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
          >
            ← 음성 기능 페이지
          </a>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
