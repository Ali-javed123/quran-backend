export const processAudioStream = (audioChunks) => {
  // Combine all audio chunks
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combinedBuffer = Buffer.concat(audioChunks, totalLength);
  
  return combinedBuffer;
};

export const validateAudioFormat = (buffer) => {
  // Check WAV header
  if (buffer.length < 44) return false;
  
  // Check RIFF header
  const isRIFF = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWAVE = buffer.toString('ascii', 8, 12) === 'WAVE';
  // ds
  return isRIFF && isWAVE;
};

export const getAudioDuration = (buffer, sampleRate = 16000) => {
  if (buffer.length < 44) return 0;
  
  // Read data chunk size
  const dataSize = buffer.readUInt32LE(40);
  const bytesPerSecond = sampleRate * 2; // 16-bit audio
  
  return dataSize / bytesPerSecond;
};
