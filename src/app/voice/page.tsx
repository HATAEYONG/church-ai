/**
 * 음성 기능 데모 페이지
 *
 * 텍스트를 입력하고 음성으로 변환해볼 수 있는 데모 페이지입니다.
 */

'use client';

import { useState } from 'react';
import VoicePlayer, { VoiceCard } from '@/components/VoicePlayer';

export default function VoicePage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('default');

  const sampleTexts = {
    prayer: '주님, 오늘 하루도 감사합니다. 저를 인도하시고 보호해주세요.',
    gratitude: '오늘 가장 감사한 것은 가족과 함께하는 시간이었습니다.',
    bible: '태초에 하나님이 천지를 창조하시니라.',
    mentor: '안녕하세요, 저는 요셉입니다. 꿈과 환난을 통해 하나님의 인도하심을 체험한 사람입니다.',
  };

  const [currentSample, setCurrentSample] = useState('');

  const handleSampleClick = (sampleKey: string, sampleText: string) => {
    setText(sampleText);
    setCurrentSample(sampleKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎙️ AI 음성 기능
          </h1>
          <p className="text-lg text-gray-600">
            텍스트를 자연스러운 AI 목소리로 변환하여 들어보세요
          </p>
        </div>

        {/* 샘플 텍스트 선택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📝 샘플 텍스트
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleSampleClick('prayer', sampleTexts.prayer)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSample === 'prayer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-2">🙏</div>
              <div className="text-sm font-medium">기도</div>
            </button>

            <button
              onClick={() => handleSampleClick('gratitude', sampleTexts.gratitude)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSample === 'gratitude'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-2xl mb-2">💛</div>
              <div className="text-sm font-medium">감사</div>
            </button>

            <button
              onClick={() => handleSampleClick('bible', sampleTexts.bible)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSample === 'bible'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="text-sm font-medium">성경</div>
            </button>

            <button
              onClick={() => handleSampleClick('mentor', sampleTexts.mentor)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSample === 'mentor'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="text-2xl mb-2">🕊️</div>
              <div className="text-sm font-medium">AI 멘토</div>
            </button>
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ✍️ 텍스트 입력
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="음성으로 변환할 텍스트를 입력하세요..."
            className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="mt-4 text-sm text-gray-500">
            글자 수: {text.length}자
          </div>
        </div>

        {/* 음성 재생 */}
        {text && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🔊 음성 재생
            </h2>
            <VoiceCard text={text} />
          </div>
        )}

        {/* 사용 안내 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 사용 안내
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li>• 샘플 텍스트를 선택하거나 직접 텍스트를 입력하세요</li>
            <li>• '음성 듣기' 버튼을 클릭하면 AI 목소리로 읽어줍니다</li>
            <li>• 다양한 목소리는 설정 페이지에서 선택할 수 있습니다</li>
            <li>• 기도/감사 노트, AI 멘토, 성경 읽기 등에서 음성 기능을 사용할 수 있습니다</li>
          </ul>
        </div>

        {/* 다른 페이지로 이동 */}
        <div className="mt-8 text-center">
          <a
            href="/voice-settings"
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            ⚙️ 목소리 설정하러 가기
          </a>
        </div>
      </div>
    </div>
  );
}
