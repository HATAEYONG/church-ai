/**
 * 보이스 클로닝 페이지
 *
 * 사용자가 오디오 파일을 업로드하여 자신만의 목소리를 생성합니다.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { getElevenLabsClient, ClonedVoice } from '@/lib/elevenlabs';

export default function VoiceClonePage() {
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setHasApiKey(!!localStorage.getItem('ELEVENLABS_API_KEY'));
    loadClonedVoices();
  }, []);

  const loadClonedVoices = async () => {
    try {
      const client = getElevenLabsClient();
      const voices = await client.getClonedVoices();
      setClonedVoices(voices);

      // localStorage에도 저장
      localStorage.setItem('clonedVoices', JSON.stringify(voices));
    } catch (error) {
      console.error('클로닝된 목소리 불러오기 실패:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setAudioFiles(fileArray);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files).filter((file) => file.type.startsWith('audio/'));
      if (fileArray.length > 0) {
        setAudioFiles(fileArray);
        setError(null);
      } else {
        setError('오디오 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!voiceName.trim()) {
      setError('목소리 이름을 입력해주세요.');
      return;
    }

    if (audioFiles.length === 0) {
      setError('적어도 하나의 오디오 파일이 필요합니다.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const client = getElevenLabsClient();
      const voiceId = await client.createVoiceClone({
        name: voiceName,
        description: voiceDescription,
        files: audioFiles,
      });

      setSuccess(true);
      setVoiceName('');
      setVoiceDescription('');
      setAudioFiles([]);

      // 목소리 목록 새로고침
      await loadClonedVoices();

      // 3초 후 성공 메시지 숨김
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '목소리 클로닝 실패';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    if (!confirm('정말 이 목소리를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const client = getElevenLabsClient();
      await client.deleteClonedVoice(voiceId);

      // 목소리 목록에서 제거
      setClonedVoices(clonedVoices.filter((v) => v.voice_id !== voiceId));

      // localStorage 업데이트
      const updated = clonedVoices.filter((v) => v.voice_id !== voiceId);
      localStorage.setItem('clonedVoices', JSON.stringify(updated));

      alert('목소리가 삭제되었습니다.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '목소리 삭제 실패';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎤 보이스 클로닝
          </h1>
          <p className="text-lg text-gray-600">
            나만의 목소리를 만들어보세요!
          </p>
        </div>

        {/* API 키 안내 */}
        {mounted && !hasApiKey && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              ⚠️ API Key 필요
            </h3>
            <p className="text-yellow-700 mb-4">
              보이스 클로닝 기능을 사용하려면 ElevenLabs API Key가 필요합니다.
            </p>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>API Key 발급 방법:</strong>
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>https://elevenlabs.io 접속</li>
                <li>회원가입 (무료 플랜 가능)</li>
                <li>Settings → API Keys</li>
                <li>생성된 키를 아래 입력란에 붙여넣기</li>
              </ol>
            </div>
          </div>
        )}

        {/* 목소리 생성 폼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🎙️ 목소리 생성
          </h2>

          {/* 목소리 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목소리 이름 *
            </label>
            <input
              type="text"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="예: 나의 목소리"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* 설명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={voiceDescription}
              onChange={(e) => setVoiceDescription(e.target.value)}
              placeholder="목소리에 대한 설명을 입력하세요..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none h-20"
            />
          </div>

          {/* 오디오 파일 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              오디오 샘플 * (최소 1개, 10초 이상 권장)
            </label>

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                audioFiles.length > 0
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
            >
              {audioFiles.length === 0 ? (
                <div>
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-gray-600 mb-4">
                    오디오 파일을 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    파일 선택
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-gray-800 font-semibold mb-2">
                    {audioFiles.length}개 파일 선택됨
                  </p>
                  <div className="space-y-2">
                    {audioFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
                        📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setAudioFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    파일 다시 선택
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 업로드 버튼 */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !voiceName.trim() || audioFiles.length === 0}
            className={`w-full py-4 rounded-lg font-semibold transition-colors ${
              isUploading || !voiceName.trim() || audioFiles.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>목소리 생성 중... (5-10분 소요)</span>
              </span>
            ) : (
              '🎤 목소리 생성 시작'
            )}
          </button>

          {/* 성공 메시지 */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 text-center">
              ✅ 목소리가 성공적으로 생성되었습니다! 목소리 설정 페이지에서 선택할 수 있습니다.
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 클로닝된 목소리 목록 */}
        {clonedVoices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🎤 내 목소리 ({clonedVoices.length})
            </h2>
            <div className="space-y-3">
              {clonedVoices.map((voice) => (
                <div
                  key={voice.voice_id}
                  className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{voice.name}</h3>
                      <p className="text-sm text-gray-600">{voice.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        샘플 수: {voice.samples} | 생성일: {new Date(voice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteVoice(voice.voice_id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 가이드라인 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 보이스 클로닝 가이드라인
          </h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p><strong>1. 샘플링 오디오 품질:</strong> 10초 이상의 깨끗한 오디오 (잡음 없음)</p>
            <p><strong>2. 다양한 발음:</strong> 높고 낮은 톤, 감정 표현 등 다양하게</p>
            <p><strong>3. 파일 형식:</strong> MP3, WAV, M4A 등 오디오 파일 지원</p>
            <p><strong>4. 생성 시간:</strong> 약 5-10분 소요 (기다려 주세요!)</p>
            <p><strong>5. 한도:</strong> 무료 플랜 최대 3개 커스텀 목소리</p>
          </div>
        </div>

        {/* 다른 페이지로 이동 */}
        <div className="mt-8 text-center">
          <a
            href="/voice-settings"
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mr-4"
          >
            목소리 설정하러 가기
          </a>
          <a
            href="/voice"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            음성 기능 페이지
          </a>
        </div>
      </div>
    </div>
  );
}
