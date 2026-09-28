/**
 * ELIM SPRINGS — Audio WAV Encoder Utility
 * Converts MediaRecorder audio Blobs (audio/webm, audio/ogg, audio/mp4)
 * into uncompressed 16-bit PCM WAV (audio/wav) format required by MeitY Bhashini ASR.
 */

export interface WavConversionResult {
  blob: Blob;
  base64: string;
  dataUri: string;
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  byteLength: number;
  sha256Hash?: string;
}

/**
 * Encodes a Float32Array of audio samples into a standard 16-bit mono PCM WAV ArrayBuffer.
 */
export function encodePcmToWav(
  samples: Float32Array,
  sampleRate: number = 16000
): ArrayBuffer {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const dataByteLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF Chunk Descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true); // ChunkSize
  writeString(8, 'WAVE');

  // 2. "fmt " Sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM (16 bytes)
  view.setUint16(20, 1, true); // AudioFormat: 1 = PCM
  view.setUint16(22, numChannels, true); // NumChannels: 1 = mono
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample: 16-bit

  // 3. "data" Sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true); // Subchunk2Size

  // 4. Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Resamples and converts an AudioBuffer to a 16-bit mono PCM WAV ArrayBuffer.
 * Targets 16,000 Hz mono by default, as expected by Indian ASR models (Bhashini/AI4Bharat).
 */
export function encodeAudioBufferToWav(
  audioBuffer: AudioBuffer,
  targetSampleRate: number = 16000
): ArrayBuffer {
  const sourceSampleRate = audioBuffer.sampleRate;
  const sourceData = audioBuffer.getChannelData(0);

  // If stereo, average down to mono
  let monoData = sourceData;
  if (audioBuffer.numberOfChannels > 1) {
    const channel2 = audioBuffer.getChannelData(1);
    monoData = new Float32Array(sourceData.length);
    for (let i = 0; i < sourceData.length; i++) {
      monoData[i] = (sourceData[i] + channel2[i]) / 2;
    }
  }

  // Resample to targetSampleRate using linear interpolation
  const sampleRateRatio = sourceSampleRate / targetSampleRate;
  const targetLength = Math.round(monoData.length / sampleRateRatio);
  const resampledData = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const sourceIndex = i * sampleRateRatio;
    const indexFloor = Math.floor(sourceIndex);
    const indexCeil = Math.min(monoData.length - 1, indexFloor + 1);
    const weight = sourceIndex - indexFloor;
    resampledData[i] = monoData[indexFloor] * (1 - weight) + monoData[indexCeil] * weight;
  }

  return encodePcmToWav(resampledData, targetSampleRate);
}

/**
 * Converts an arbitrary audio Blob (WebM/Ogg/MP4) into 16-bit PCM WAV.
 */
export async function convertBlobToWav(
  audioBlob: Blob,
  targetSampleRate: number = 16000
): Promise<WavConversionResult> {
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('Web Audio API (AudioContext) is not supported in this browser.');
  }

  const audioContext = new AudioContextClass();

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavArrayBuffer = encodeAudioBufferToWav(audioBuffer, targetSampleRate);
    const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

    // Convert to base64
    const base64 = await blobToBase64(wavBlob);
    const dataUri = `data:audio/wav;base64,${base64}`;

    return {
      blob: wavBlob,
      base64,
      dataUri,
      sampleRate: targetSampleRate,
      channels: 1,
      durationSeconds: audioBuffer.duration,
      byteLength: wavArrayBuffer.byteLength,
    };
  } finally {
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}

/**
 * Converts a Blob to a raw base64 string (without the data: MIME prefix).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1] || '';
        resolve(base64);
      } else {
        reject(new Error('Failed to read blob as Base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Computes SHA-256 hash of an audio ArrayBuffer using Web Crypto API.
 */
export async function computeAudioHash(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback simple hash for non-crypto environments
  let hash = 0;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    hash = (hash << 5) - hash + bytes[i];
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(16, '0');
}
