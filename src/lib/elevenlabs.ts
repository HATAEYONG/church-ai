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

// 기본 목소리 ID (디폴트)
const DEFAULT_VOICES = {
  EN_MALE_1: 'azfTVEQ83m4HvnRuTWH4', // Adam (남자1)
  EN_FEMALE_1: 'EXAVITQu4vr4xnSDxMaL', // Rachel (여자1)
};

// 기본 설정
const DEFAULT_MODEL = 'eleven_multilingual_v2';
const DEFAULT_VOICE_ID = 'azfTVEQ83m4HvnRuTWH4'; // Adam (남자1 - 기본)

export class ElevenLabsClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
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
      const allVoices = response.data.voices;

      // 사용자 정의 목소리만 필터링 (samples가 있는 목소리)
      return allVoices
        .filter((voice: any) => voice.samples && voice.samples.length > 0)
        .map((voice: any) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          description: voice.description || '클로닝된 목소리',
          samples: voice.samples.length,
          created_at: voice.created_at,
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

  if (!client.hasApiKey()) {
    throw new Error('음성 기능을 사용하려면 ElevenLabs API Key가 필요합니다.\n목소리 설정 페이지에서 API Key를 입력해주세요.');
  }

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

/**
 * API Key가 있는지 확인
 */
export function hasElevenLabsApiKey(): boolean {
  const client = getElevenLabsClient();
  return client.hasApiKey();
}

// 기본 목소리 ID들 내보내기
export { DEFAULT_VOICES, DEFAULT_MODEL, DEFAULT_VOICE_ID };
