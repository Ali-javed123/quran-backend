// import { Groq } from 'groq-sdk';
// import dotenv from "dotenv";

// dotenv.config();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// /**
//  * Convert audio buffer to Arabic text using Groq Whisper
//  * @param {Buffer} audioBuffer - Audio data buffer
//  * @param {string} mimeType - Audio MIME type
//  * @returns {Promise<string>} Transcribed Arabic text
//  */
// export const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
//   try {
//     // Create a File object from buffer
//     const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
//     const transcription = await groq.audio.transcriptions.create({
//       file: audioFile,
//       model: "whisper-large-v3-turbo",
//       language: "ar",
//       response_format: "verbose_json",
//       temperature: 0.2,
//       prompt: "This is Quranic Arabic recitation. Please transcribe accurately with proper Arabic script."
//     });
    
//     return transcription.text;
//   } catch (error) {
//     console.error("Transcription Error:", error);
//     throw new Error(`Speech to text failed: ${error.message}`);
//   }
// };

// /**
//  * Transcribe with word-level timestamps
//  * @param {Buffer} audioBuffer 
//  * @param {string} mimeType 
//  * @returns {Promise<Object>} Transcription with word timings
//  */
// export const transcribeWithTimings = async (audioBuffer, mimeType = 'audio/webm') => {
//   try {
//     const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
//     const transcription = await groq.audio.transcriptions.create({
//       file: audioFile,
//       model: "whisper-large-v3-turbo",
//       language: "ar",
//       response_format: "verbose_json",
//       temperature: 0.2,
//       timestamp_granularities: ["word"]
//     });
    
//     return {
//       text: transcription.text,
//       words: transcription.words || [],
//       duration: transcription.duration
//     };
//   } catch (error) {
//     console.error("Transcription with timings error:", error);
//     return { text: "", words: [], duration: 0 };
//   }
// };
// services/speechToText.service.js
import { Groq } from 'groq-sdk';
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Whisper prompt engineered for Pakistani/Urdu native Quran recitation
 * Key: Tell Whisper to expect Quranic Arabic so it stays in Arabic script
 * and doesn't Romanize or switch to Urdu
 */
const QURAN_WHISPER_PROMPT = 
  'بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم';

/**
 * Post-process Whisper output:
 * - Sometimes Whisper outputs "اياك" without the "و" prefix for "وإياك"
 * - Fix common Pakistani-accent Whisper mistakes
 */
const postProcessWhisperOutput = (text) => {
  if (!text) return '';
  
  let processed = text.trim();
  
  // Remove any Latin characters that slipped in
  processed = processed.replace(/[a-zA-Z]/g, '');
  
  // Remove extra punctuation
  processed = processed.replace(/[،,\.。]/g, ' ');
  
  // Normalize multiple spaces
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
};

export const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
  try {
    const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
    const transcription = await groq.audio.transcriptions.create({
      file            : audioFile,
      model           : 'whisper-large-v3',          // Use v3 (more accurate than turbo for Arabic)
      language        : 'ar',
      response_format : 'verbose_json',
      temperature     : 0.0,                          // 0 = most deterministic
      prompt          : QURAN_WHISPER_PROMPT,
    });
    
    const rawText = transcription.text?.trim() || '';
    return postProcessWhisperOutput(rawText);
  } catch (error) {
    console.error("Transcription Error:", error);
    throw new Error(`Speech to text failed: ${error.message}`);
  }
};

export const transcribeWithTimings = async (audioBuffer, mimeType = 'audio/webm') => {
  try {
    const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
    const transcription = await groq.audio.transcriptions.create({
      file                      : audioFile,
      model                     : 'whisper-large-v3',
      language                  : 'ar',
      response_format           : 'verbose_json',
      temperature               : 0.0,
      prompt                    : QURAN_WHISPER_PROMPT,
      timestamp_granularities   : ["word"]
    });
    
    return {
      text     : postProcessWhisperOutput(transcription.text),
      words    : transcription.words || [],
      duration : transcription.duration
    };
  } catch (error) {
    console.error("Transcription with timings error:", error);
    return { text: "", words: [], duration: 0 };
  }
};
// services/speechToText.service.js
// import { Groq } from 'groq-sdk';
// import dotenv from "dotenv";

// dotenv.config();

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// /**
//  * Whisper prompt engineered for Pakistani/Urdu native Quran recitation
//  * Key: Tell Whisper to expect Quranic Arabic so it stays in Arabic script
//  * and doesn't Romanize or switch to Urdu
//  */
// const QURAN_WHISPER_PROMPT = 
//   'بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم';

// /**
//  * Post-process Whisper output:
//  * - Sometimes Whisper outputs "اياك" without the "و" prefix for "وإياك"
//  * - Fix common Pakistani-accent Whisper mistakes
//  */
// const postProcessWhisperOutput = (text) => {
//   if (!text) return '';
  
//   let processed = text.trim();
  
//   // Remove any Latin characters that slipped in
//   processed = processed.replace(/[a-zA-Z]/g, '');
  
//   // Remove extra punctuation
//   processed = processed.replace(/[،,\.。]/g, ' ');
  
//   // Normalize multiple spaces
//   processed = processed.replace(/\s+/g, ' ').trim();
  
//   return processed;
// };

// export const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
//   try {
//     const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
//     const transcription = await groq.audio.transcriptions.create({
//       file            : audioFile,
//       model           : 'whisper-large-v3',          // Use v3 (more accurate than turbo for Arabic)
//       language        : 'ar',
//       response_format : 'verbose_json',
//       temperature     : 0.0,                          // 0 = most deterministic
//       prompt          : QURAN_WHISPER_PROMPT,
//     });
    
//     const rawText = transcription.text?.trim() || '';
//     return postProcessWhisperOutput(rawText);
//   } catch (error) {
//     console.error("Transcription Error:", error);
//     throw new Error(`Speech to text failed: ${error.message}`);
//   }
// };

// export const transcribeWithTimings = async (audioBuffer, mimeType = 'audio/webm') => {
//   try {
//     const audioFile = new File([audioBuffer], 'recording.webm', { type: mimeType });
    
//     const transcription = await groq.audio.transcriptions.create({
//       file                      : audioFile,
//       model                     : 'whisper-large-v3',
//       language                  : 'ar',
//       response_format           : 'verbose_json',
//       temperature               : 0.0,
//       prompt                    : QURAN_WHISPER_PROMPT,
//       timestamp_granularities   : ["word"]
//     });
    
//     return {
//       text     : postProcessWhisperOutput(transcription.text),
//       words    : transcription.words || [],
//       duration : transcription.duration
//     };
//   } catch (error) {
//     console.error("Transcription with timings error:", error);
//     return { text: "", words: [], duration: 0 };
//   }
// };