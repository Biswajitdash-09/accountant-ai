// Audio utilities for Voice Agent

// Audio Queue for sequential playback with error recovery
export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;
  private onPlaybackStart?: () => void;
  private onPlaybackEnd?: () => void;
  private consecutiveErrors = 0;
  private maxConsecutiveErrors = 3;

  constructor(
    audioContext: AudioContext,
    options?: {
      onPlaybackStart?: () => void;
      onPlaybackEnd?: () => void;
    }
  ) {
    this.audioContext = audioContext;
    this.onPlaybackStart = options?.onPlaybackStart;
    this.onPlaybackEnd = options?.onPlaybackEnd;
  }

  async addToQueue(audioData: Uint8Array): Promise<void> {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.consecutiveErrors = 0;
      this.onPlaybackEnd?.();
      return;
    }

    // Check for too many consecutive errors
    if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
      this.clear();
      this.isPlaying = false;
      this.consecutiveErrors = 0;
      this.onPlaybackEnd?.();
      return;
    }

    if (!this.isPlaying) {
      this.onPlaybackStart?.();
    }
    
    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const wavData = createWavFromPCM(audioData);
      const arrayBuffer = wavData.buffer.slice(0) as ArrayBuffer;
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.consecutiveErrors = 0;
        this.playNext();
      };
      
      source.start(0);
    } catch (error) {
      this.consecutiveErrors++;
      // Continue with next segment even if current fails
      this.playNext();
    }
  }

  clear(): void {
    this.queue = [];
    this.consecutiveErrors = 0;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get queueLength(): number {
    return this.queue.length;
  }
}

// Create WAV from PCM16 data
export const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  // Handle empty or invalid data
  if (!pcmData || pcmData.length === 0) {
    return new Uint8Array(44); // Return empty WAV header
  }

  // Ensure even number of bytes for 16-bit samples
  const adjustedLength = pcmData.length - (pcmData.length % 2);
  
  // Convert bytes to 16-bit samples (little-endian)
  const int16Data = new Int16Array(adjustedLength / 2);
  for (let i = 0; i < adjustedLength; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }

  // WAV header parameters
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = int16Data.byteLength;

  // Create WAV header (44 bytes)
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Combine header and data
  const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);

  return wavArray;
};

// Decode base64 audio from API response with validation
export const decodeAudioFromAPI = (base64Audio: string): Uint8Array => {
  if (!base64Audio || typeof base64Audio !== 'string') {
    return new Uint8Array(0);
  }

  try {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    return new Uint8Array(0);
  }
};

// Encode Float32Array audio to base64 PCM16 (kept for potential future use)
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
};
