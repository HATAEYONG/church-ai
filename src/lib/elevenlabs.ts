/**
 * 일레븐랩스(ElevenLabs) TTS API 클라이언트
 *
 * 텍스트를 음성으로 변환하는 Text-to-Speech 기능과
 * 보이스 클로닝 기능을 제공합니다.
 * https://elevenlabs.io/docs
 */

import axios, { AxiosInstance } from 'axios';

// 음성 합성 옵션
export interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number; // 0~1, 안정성
  similarityBoost?: number; // 0~1, 유사성 부스트
  speakerBoost?: boolean; // 스피커 부스트
}

// 목소리 정보
export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  labels?: Record<string, string>;
}

// 보이스 클로닝 옵션
export interface VoiceCloneOptions {
  name: string;
  description?: string;
  files?: File[]; // 오디오 파일들
}

// 클로닝된 목소리 정보
export interface ClonedVoice {
  voice_id: string;
  name: string;
  description: string;
  samples: number;
  created_at: string;
}

// ElevenLabs /voices 응답의 원시 목소리 형태(필요한 필드만)
interface RawVoice {
  voice_id: string;
  name: string;
  description?: string;
  created_at?: string;
  samples?: unknown[];
}

// 기본 목소리 ID (디폴트)
const DEFAULT_VOICES = {
  EN_MALE_1: 'azfTVEQ83m4HvnRuTWH4', // Adam (남자1)
  EN_FEMALE_1: 'EXAVITQu4vr4xnSDxMaL', // Rachel (여자1)
};

// 기본 설정
const DEFAULT_MODEL = 'eleven_multilingual_v2';
const DEFAULT_VOICE_ID = 'azfTVEQ83m4HvnRuTWH4'; // Adam (남자1 - 기본)

// API 키 저장소
// 브라우저에서는 설정 페이지에서 입력한 값을 localStorage 에 보관하고(BYO 키),
// 서버에서는 환경 변수(ELEVENLABS_API_KEY)를 사용합니다.
export const ELEVENLABS_KEY_STORAGE = 'ELEVENLABS_API_KEY';

export function getStoredElevenLabsKey(): string {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(ELEVENLABS_KEY_STORAGE) || '';
  }
  return process.env.ELEVENLABS_API_KEY || '';
}

export function setStoredElevenLabsKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(ELEVENLABS_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(ELEVENLABS_KEY_STORAGE);
  }
}

export function clearStoredElevenLabsKey(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ELEVENLABS_KEY_STORAGE);
}

export class ElevenLabsClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getStoredElevenLabsKey();
    this.client = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: this.apiKey ? {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      } : {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * API 키가 있는지 확인
   */
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * 텍스트를 음성으로 변환
   * @param options TTS 옵션
   * @returns 오디오 Blob
   */
  async textToSpeech(options: TTSOptions): Promise<Blob> {
    if (!this.hasApiKey()) {
      throw new Error('API 키가 필요합니다. ElevenLabs API Key를 설정해주세요.');
    }

    const {
      text,
      voiceId = DEFAULT_VOICE_ID,
      modelId = DEFAULT_MODEL,
      stability = 0.5,
      similarityBoost = 0.75,
      speakerBoost = true,
    } = options;

    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            speaker_boost: speakerBoost,
          },
        },
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw new Error('음성 변환 실패');
    }
  }

  /**
   * 사용 가능한 목소리 목록 조회
   */
  async getVoices(): Promise<Voice[]> {
    if (!this.hasApiKey()) {
      // API 없으면 기본 목소리 반환
      return [
        {
          voice_id: DEFAULT_VOICES.EN_MALE_1,
          name: 'Adam (남자1)',
          category: '기본',
          description: '신뢰감 있는 남성 목소리',
        },
        {
          voice_id: DEFAULT_VOICES.EN_FEMALE_1,
          name: 'Rachel (여자1)',
          category: '기본',
          description: '따뜻하고 부드러운 여성 목소리',
        },
      ];
    }

    try {
      const response = await this.client.get('/voices');
      return response.data.voices;
    } catch (error) {
      console.error('ElevenLabs Get Voices Error:', error);
      // API 호출 실패해도 기본 목소리 반환
      return [
        {
          voice_id: DEFAULT_VOICES.EN_MALE_1,
          name: 'Adam (남자1)',
          category: '기본',
          description: '신뢰감 있는 남성 목소리',
        },
        {
          voice_id: DEFAULT_VOICES.EN_FEMALE_1,
          name: 'Rachel (여자1)',
          category: '기본',
          description: '따뜻하고 부드러운 여성 목소리',
        },
      ];
    }
  }

  /**
   * 보이스 클로닝 (목소리 생성)
   * @param options 클로닝 옵션
   * @returns 생성된 목소리 ID
   */
  async createVoiceClone(options: VoiceCloneOptions): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('보이스 클로닝은 API 키가 필요합니다.');
    }

    const { name, description, files } = options;

    try {
      // FormData로 오디오 파일들 전송
      const formData = new FormData();
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      } else {
        throw new Error('적어도 하나의 오디오 샘플이 필요합니다.');
      }

      const response = await this.client.post('/voices/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.voice_id;
    } catch (error) {
      console.error('ElevenLabs Voice Clone Error:', error);
      throw new Error('목소리 클로닝 실패');
    }
  }

  /**
   * 클로닝된 목소리 목록 조회
   */
  async getClonedVoices(): Promise<ClonedVoice[]> {
    if (!this.hasApiKey()) {
      return [];
    }

    try {
      const response = await this.client.get('/voices');
      const allVoices: RawVoice[] = response.data.voices;

      // 사용자 정의 목소리만 필터링 (samples가 있는 목소리)
      return allVoices
        .filter((voice) => voice.samples && voice.samples.length > 0)
        .map((voice) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          description: voice.description || '클로닝된 목소리',
          samples: voice.samples?.length ?? 0,
          created_at: voice.created_at ?? new Date().toISOString(),
        }));
    } catch (error) {
      console.error('ElevenLabs Get Cloned Voices Error:', error);
      return [];
    }
  }

  /**
   * 클로닝된 목소리 삭제
   */
  async deleteClonedVoice(voiceId: string): Promise<void> {
    if (!this.hasApiKey()) {
      throw new Error('API 키가 필요합니다.');
    }

    try {
      await this.client.delete(`/voices/${voiceId}`);
    } catch (error) {
      console.error('ElevenLabs Delete Voice Error:', error);
      throw new Error('목소리 삭제 실패');
    }
  }

  /**
   * 기본 설정으로 빠른 TTS
   */
  async quickTTS(text: string): Promise<Blob> {
    return this.textToSpeech({ text });
  }

  /**
   * 스트리밍 TTS (실시간 재생용)
   */
  async textToSpeechStream(options: TTSOptions): Promise<ReadableStream> {
    if (!this.hasApiKey()) {
      throw new Error('API 키가 필요합니다.');
    }

    const {
      text,
      voiceId = DEFAULT_VOICE_ID,
      modelId = DEFAULT_MODEL,
    } = options;

    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}/stream`,
        {
          text,
          model_id: modelId,
        },
        {
          responseType: 'stream',
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs Streaming TTS Error:', error);
      throw new Error('스트리밍 음성 변환 실패');
    }
  }

  /**
   * API 키 유효성 검사
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.hasApiKey()) {
      return false;
    }

    try {
      await this.getVoices();
      return true;
    } catch {
      return false;
    }
  }
}

// 싱글톤 인스턴스 (저장된 키가 바뀌면 다시 생성)
let clientInstance: ElevenLabsClient | null = null;
let clientKey: string | null = null;

/**
 * ElevenLabs 클라이언트 인스턴스 가져오기.
 * 설정에서 키가 변경되면 새 인스턴스로 교체합니다.
 */
export function getElevenLabsClient(): ElevenLabsClient {
  const key = getStoredElevenLabsKey();
  if (!clientInstance || clientKey !== key) {
    clientInstance = new ElevenLabsClient(key);
    clientKey = key;
  }
  return clientInstance;
}

/**
 * 목업 모드: 브라우저 내장 음성 합성(Web Speech API)으로 텍스트를 읽어줍니다.
 * API 키가 없어도 음성 기능을 바로 체험할 수 있게 합니다.
 */
function playWithBrowserTTS(text: string, onStart?: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('이 브라우저는 음성 합성을 지원하지 않습니다.'));
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel(); // 진행 중인 발화 중단
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.onstart = () => onStart?.();
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('음성 재생에 실패했습니다.'));
    synth.speak(utterance);
  });
}

/**
 * 브라우저에서 사용할 수 있는 TTS 헬퍼 함수.
 * - API 키가 없으면 브라우저 내장 음성(목업)으로 재생합니다.
 * - API 키가 있으면 ElevenLabs 고품질 음성으로 재생합니다.
 * @param onStart 실제 재생이 시작되는 순간 호출됩니다(로딩 → 재생 상태 전환용).
 */
export async function playTTS(
  text: string,
  options?: Partial<TTSOptions>,
  onStart?: () => void,
): Promise<void> {
  // 키가 없으면 목업(브라우저 음성)으로 동작
  if (!getStoredElevenLabsKey()) {
    return playWithBrowserTTS(text, onStart);
  }

  const client = getElevenLabsClient();
  const audioBlob = await client.textToSpeech({ text, ...options });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    audio.onplay = () => onStart?.();
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('음성 재생 실패'));
    };
    audio.play().catch(reject);
  });
}

/**
 * ElevenLabs API Key가 설정되어 있는지 확인 (없으면 목업 모드)
 */
export function hasElevenLabsApiKey(): boolean {
  return getStoredElevenLabsKey().length > 0;
}

// 기본 목소리 ID들 내보내기
export { DEFAULT_VOICES, DEFAULT_MODEL, DEFAULT_VOICE_ID };
