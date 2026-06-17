/**
 * 일레븐랩스(ElevenLabs) TTS API 클라이언트
 *
 * 텍스트를 음성으로 변환하는 Text-to-Speech 기능을 제공합니다.
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

// 기본 목소리 ID (한국어 지원 목소리)
const DEFAULT_VOICES = {
  // 한국어 남성
  KO_MALE_1: 'pNHzzTJ4Yqdx81kZRK2E', // 예시
  // 한국어 여성
  KO_FEMALE_1: 'oWaQZz9yI6vtZluQEi7C', // 예시
  // 영어 (일반적으로 사용)
  EN_MALE_1: 'azfTVEQ83m4HvnRuTWH4', // Adam
  EN_FEMALE_1: 'EXAVITQu4vr4xnSDxMaL', // Rachel
};

// 기본 설정
const DEFAULT_MODEL = 'eleven_multilingual_v2'; // 다국어 지원 모델
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel (다국어 지원)

export class ElevenLabsClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 텍스트를 음성으로 변환
   * @param options TTS 옵션
   * @returns 오디오 Blob
   */
  async textToSpeech(options: TTSOptions): Promise<Blob> {
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
    try {
      const response = await this.client.get('/voices');
      return response.data.voices;
    } catch (error) {
      console.error('ElevenLabs Get Voices Error:', error);
      throw new Error('목소리 목록 조회 실패');
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
    try {
      await this.getVoices();
      return true;
    } catch {
      return false;
    }
  }
}

// 싱글톤 인스턴스
let clientInstance: ElevenLabsClient | null = null;

/**
 * ElevenLabs 클라이언트 인스턴스 가져오기
 */
export function getElevenLabsClient(): ElevenLabsClient {
  if (!clientInstance) {
    clientInstance = new ElevenLabsClient();
  }
  return clientInstance;
}

/**
 * 브라우저에서 사용할 수 있는 TTS 헬퍼 함수
 */
export async function playTTS(text: string, options?: Partial<TTSOptions>): Promise<void> {
  const client = getElevenLabsClient();
  const audioBlob = await client.textToSpeech({ text, ...options });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };

    audio.play().catch(reject);
  });
}

// 기본 목소리 ID들 내보내기
export { DEFAULT_VOICES, DEFAULT_MODEL, DEFAULT_VOICE_ID };
