import assert from 'node:assert';

// Standalone test for WAV encoding logic
function encodePcmToWav(samples, sampleRate = 16000) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const dataByteLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');

  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true); // 16-bit

  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

console.log('Testing WAV Encoder...');

// Generate 1 second of 440Hz sine wave at 16000 Hz
const sampleRate = 16000;
const numSamples = 16000;
const samples = new Float32Array(numSamples);
for (let i = 0; i < numSamples; i++) {
  samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
}

const wavBuffer = encodePcmToWav(samples, sampleRate);
const view = new DataView(wavBuffer);

// Test 1: Total size should be 44 + (16000 * 2) = 32044 bytes
assert.strictEqual(wavBuffer.byteLength, 44 + numSamples * 2, 'WAV byte length should match 44 header + 32000 data');

// Test 2: RIFF signature
const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
assert.strictEqual(riff, 'RIFF', 'Header must start with RIFF');

// Test 3: WAVE signature
const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
assert.strictEqual(wave, 'WAVE', 'Header must have WAVE signature');

// Test 4: fmt subchunk
const fmt = String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15));
assert.strictEqual(fmt, 'fmt ', 'Header must have fmt subchunk');

// Test 5: Audio format = 1 (PCM)
assert.strictEqual(view.getUint16(20, true), 1, 'AudioFormat must be 1 (PCM)');

// Test 6: Number of channels = 1 (Mono)
assert.strictEqual(view.getUint16(22, true), 1, 'NumChannels must be 1 (mono)');

// Test 7: Sample rate = 16000
assert.strictEqual(view.getUint32(24, true), 16000, 'SampleRate must be 16000');

// Test 8: Byte rate = 16000 * 1 * 2 = 32000
assert.strictEqual(view.getUint32(28, true), 32000, 'ByteRate must be 32000 bytes/sec');

// Test 9: Block align = 2
assert.strictEqual(view.getUint16(32, true), 2, 'BlockAlign must be 2 bytes');

// Test 10: Bits per sample = 16
assert.strictEqual(view.getUint16(34, true), 16, 'BitsPerSample must be 16');

// Test 11: data subchunk
const dataChunk = String.fromCharCode(view.getUint8(36), view.getUint8(37), view.getUint8(38), view.getUint8(39));
assert.strictEqual(dataChunk, 'data', 'Header must have data chunk signature');

// Test 12: data length
assert.strictEqual(view.getUint32(40, true), numSamples * 2, 'Data size must be 32000');

// Test 13: Base64 encoding of WAV buffer
const base64Wav = Buffer.from(wavBuffer).toString('base64');
assert.ok(base64Wav.length > 1000, 'Base64 string must be populated');
assert.strictEqual(base64Wav.slice(0, 4), 'UklG', 'Base64 encoded RIFF WAV always starts with UklG');

console.log('✓ All 13 WAV encoder unit tests passed successfully!');
