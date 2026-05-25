import { Groq } from 'groq-sdk';
import Ayah from '../models/Ayah.js';
import dotenv from 'dotenv';
import { convertToRoman } from '../utils/romanMapping.js';
import { detectWaqfPositions } from '../utils/waqfHandler.js';
import { 
  WAQF_SYMBOLS, 
  analyzeWaqfWord, 
  normalizeForWaqfComparison,
  isWordAtWaqf,
  getAllWaqfPositions,
  compareWithWaqfRules
} from '../utils/waqfSoundHandler.js';
import {
  normalizeArabicText,
  soundMatch,
  wordSimilarityScore,
  areVowelEquivalent,
  areDifferentOnlyInHarakat,
  getBaseLetters,
  getCleanedWord,
  removeDiacritics
} from '../utils/arabicNormalizer.js';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// =====================================================
// STRIP HTML AND CLEAN TEXT
// =====================================================

const stripHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/<span[^>]*class="end"[^>]*>[\u0660-\u0669]+<\/span>/g, '')
    .replace(/[\u0660-\u0669]/g, '')
    .trim();
};

// =====================================================
// ADAPTIVE THRESHOLD FOR FAST/SLOW RECITATION
// =====================================================

const getAdaptiveThreshold = (spokenText, correctText) => {
  const spokenLen = spokenText.length;
  const correctLen = correctText.length;
  const ratio = spokenLen / correctLen;
  
  // Fast recitation (user reads fast, merges words)
  if (ratio < 0.7) return 75;  // Lower threshold for fast recitation
  // Slow recitation (user reads slow, splits words)
  if (ratio > 1.3) return 80;
  // Normal speed
  return 85;
};

// =====================================================
// TRANSCRIBE AUDIO TO ARABIC 
// =====================================================

const transcribeAudioToArabic = async (audioBuffer) => {
  try {
    const audioFile = new File([audioBuffer], 'recitation.webm', { type: 'audio/webm' });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'ar',
      response_format: 'verbose_json',
      temperature: 0.0,
      prompt: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    });

    let rawText = transcription.text?.trim() || '';
    rawText = rawText.replace(/[a-zA-Z]/g, '').replace(/\s+/g, ' ').trim();
    
    console.log(`🎙️ Whisper raw: "${rawText}"`);
    
    return rawText;
  } catch (err) {
    console.error('❌ Whisper error:', err.message);
    return null;
  }
};

// =====================================================
// WORD-LEVEL VERIFICATION WITH WAQF SOUND RULES
// =====================================================

const verifyWordByWord = (spokenText, correctText, waqfPositions = []) => {
  const spokenWords = stripHtml(spokenText).split(/\s+/).filter(Boolean);
  const correctWords = stripHtml(correctText).split(/\s+/).filter(Boolean);
  
  // Get waqf positions for this ayah
  const waqfWordIndices = getAllWaqfPositions(correctText).map(w => w.wordIndex);
  
  const results = [];
  let spokenIdx = 0;
  let correctCount = 0;
  
  // Adaptive threshold based on recitation speed
  const threshold = getAdaptiveThreshold(spokenText, correctText);
  
  console.log(`📊 Total correct words: ${correctWords.length}, Spoken words: ${spokenWords.length}`);
  console.log(`🛑 Waqf indices: ${waqfWordIndices.join(', ')}`);
  
  for (let i = 0; i < correctWords.length; i++) {
    const isAtWaqf = waqfWordIndices.includes(i);
    const correctWord = correctWords[i];
    const correctRoman = convertToRoman(correctWord, false);
    
    let userWord = null;
    let status = 'missing';
    let similarity = 0;
    let isOnlyHarakatDiff = false;
    let isVowelEqDiff = false;
    let waqfRuleApplied = false;
    let mergedUsed = false;
    
    if (spokenIdx < spokenWords.length) {
      userWord = spokenWords[spokenIdx];
      
      // STEP 1: Check with waqf sound rules
      const waqfMatch = compareWithWaqfRules(userWord, correctWord, isAtWaqf);
      
      // STEP 2: Check sound match (normalized with phonetic groups)
      const soundMatchResult = soundMatch(userWord, correctWord);
      
      // STEP 3: Check vowel equivalence (alif = zabar = khara zabar)
      const vowelEq = areVowelEquivalent(userWord, correctWord);
      
      // STEP 4: Check harakat-only difference
      const harakatOnly = areDifferentOnlyInHarakat(userWord, correctWord);
      
      if (waqfMatch || soundMatchResult) {
        status = 'correct';
        similarity = 100;
        correctCount++;
        if (isAtWaqf) {
          waqfRuleApplied = true;
          console.log(`✅ Waqf rule applied: "${userWord}" = "${correctWord}" (stopped correctly)`);
        } else {
          console.log(`✅ Sound match: "${userWord}" = "${correctWord}"`);
        }
        spokenIdx++;
      } 
      else if (harakatOnly) {
        status = 'correct';
        similarity = 100;
        isOnlyHarakatDiff = true;
        correctCount++;
        console.log(`✅ Harakat-only difference ignored: "${userWord}" vs "${correctWord}"`);
        spokenIdx++;
      }
      else if (vowelEq) {
        status = 'correct';
        similarity = 100;
        isVowelEqDiff = true;
        correctCount++;
        console.log(`✅ Vowel equivalence: "${userWord}" = "${correctWord}" (same sound)`);
        spokenIdx++;
      }
      else {
        similarity = wordSimilarityScore(userWord, correctWord);
        
        if (similarity >= threshold) {
          status = 'correct';
          correctCount++;
          console.log(`✅ High similarity (${similarity}%): "${userWord}" = "${correctWord}"`);
          spokenIdx++;
        } 
        // FAST RECITATION: Try merging current word with next word
        else if (spokenIdx + 1 < spokenWords.length) {
          const mergedWord = spokenWords[spokenIdx] + spokenWords[spokenIdx + 1];
          
          // Check merged word with waqf rules
          const mergedWaqfMatch = compareWithWaqfRules(mergedWord, correctWord, isAtWaqf);
          const mergedSoundMatch = soundMatch(mergedWord, correctWord);
          
          if (mergedWaqfMatch || mergedSoundMatch) {
            status = 'correct';
            similarity = 100;
            correctCount++;
            mergedUsed = true;
            console.log(`✅ Merged word match: "${mergedWord}" = "${correctWord}"`);
            spokenIdx += 2;
          } else {
            const mergedSimilarity = wordSimilarityScore(mergedWord, correctWord);
            if (mergedSimilarity >= threshold) {
              status = 'correct';
              similarity = mergedSimilarity;
              correctCount++;
              mergedUsed = true;
              console.log(`✅ Merged word high similarity: "${mergedWord}" = "${correctWord}"`);
              spokenIdx += 2;
            } else {
              status = similarity >= 60 ? 'close' : 'wrong';
              console.log(`❌ Wrong word: "${userWord}" vs "${correctWord}" (${similarity}%)`);
              spokenIdx++;
            }
          }
        } 
        // SLOW RECITATION: Correct word might be split into two user words
        else if (i + 1 < correctWords.length) {
          const mergedCorrect = correctWord + correctWords[i + 1];
          const isNextAtWaqf = waqfWordIndices.includes(i + 1);
          
          const splitWaqfMatch = compareWithWaqfRules(userWord, mergedCorrect, isAtWaqf || isNextAtWaqf);
          const splitSoundMatch = soundMatch(userWord, mergedCorrect);
          
          if (splitWaqfMatch || splitSoundMatch) {
            status = 'correct';
            similarity = 100;
            correctCount++;
            console.log(`✅ User word covers two correct words: "${userWord}" = "${mergedCorrect}"`);
            spokenIdx++;
            i++; // Skip next correct word
          } else {
            status = similarity >= 60 ? 'close' : 'wrong';
            console.log(`❌ Wrong word: "${userWord}" vs "${correctWord}" (${similarity}%)`);
            spokenIdx++;
          }
        }
        else {
          status = similarity >= 60 ? 'close' : 'wrong';
          console.log(`❌ Wrong word: "${userWord}" vs "${correctWord}" (${similarity}%)`);
          spokenIdx++;
        }
      }
    }
    
    results.push({
      position: i + 1,
      correctWord,
      correctRoman,
      userWord,
      userRoman: userWord ? convertToRoman(userWord, false) : null,
      status,
      similarity,
      isOnlyHarakatDiff,
      isVowelEqDiff,
      isAtWaqf,
      waqfRuleApplied,
      mergedUsed,
      hasWaqf: waqfWordIndices.includes(i)
    });
  }
  
  // Handle extra words in user text (user added words)
  while (spokenIdx < spokenWords.length) {
    const extraWord = spokenWords[spokenIdx];
    // Don't count single 'و' as error - common in recitation
    if (extraWord !== 'و' && extraWord !== 'وَا') {
      results.push({
        position: correctWords.length + 1,
        correctWord: null,
        correctRoman: null,
        userWord: extraWord,
        userRoman: convertToRoman(extraWord, false),
        status: 'extra',
        similarity: 0,
        isOnlyHarakatDiff: false,
        isVowelEqDiff: false,
        isAtWaqf: false,
        waqfRuleApplied: false,
        mergedUsed: false,
        hasWaqf: false
      });
    } else {
      correctCount++; // Count waw as correct
      console.log(`✅ Extra 'و' ignored - counted as correct`);
    }
    spokenIdx++;
  }
  
  // Calculate accuracy based on correct words
  const accuracy = Math.round((correctCount / correctWords.length) * 100);
  console.log(`📊 Final accuracy: ${accuracy}% (${correctCount}/${correctWords.length} correct)`);
  
  return {
    wordResults: results,
    accuracy,
    isPerfect: accuracy >= 95,
    correctCount,
    totalWords: correctWords.length,
    waqfWordIndices
  };
};

// =====================================================
// GROQ AI COMPARISON (FALLBACK)
// =====================================================

const compareWithGroqAI = async (spokenText, correctText) => {
  const systemPrompt = `أنت نظام للتحقق من تلاوة القرآن الكريم للقارئ الباكستاني/الأردي.

قواعد مهمة جداً يجب اتباعها بدقة:
1. الخرة زبر (ٰ) والزبر العادي (َ) والألف (ا، آ، أ، إ) كلها نفس الصوت تماماً - لا تعتبرها أخطاء
2. الحركات والتشكيل (َ ِ ُ ً ٍ ٌ) لا تؤثر على الصحة أبداً
3. القراءة السريعة التي تدمج الكلمات تعتبر صحيحة إذا كان المعنى صحيحاً
4. القراءة البطيئة التي تفصل الكلمات تعتبر صحيحة
5. إضافة أو حذف واو العطف (و) في بداية الكلمة لا يعد خطأ
6. الأصوات المتشابهة تعتبر صحيحة: (ص، س، ث) و (ذ، ز، ظ، ض) و (ح، ه)
7. عند الوقف (Waqf):
   - التنوين بالفتح (ً) يصبح ألف صوت - مثال: "عليماً" تصبح "عليما"
   - التنوين بالضم (ٌ) يصبح سكون على الحرف الأخير
   - التنوين بالكسر (ٍ) يصبح سكون على الحرف الأخير
   - تاء مربوطة (ة) تصبح هاء

أرجع JSON فقط بدون أي نص إضافي`;

  const userPrompt = `الآية الصحيحة: "${correctText}"
ما تلاه المستخدم: "${spokenText}"
أرجع JSON:
{
  "isCorrect": true/false,
  "accuracy": 0-100,
  "wrongWords": [],
  "summary": ""
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      isCorrect: parsed.isCorrect === true,
      accuracy: Number(parsed.accuracy) || 0,
      wrongWords: Array.isArray(parsed.wrongWords) ? parsed.wrongWords : [],
      summary: parsed.summary || '',
    };
  } catch (err) {
    console.error('❌ Groq AI error:', err.message);
    return null;
  }
};

// =====================================================
// LOCAL FALLBACK COMPARISON
// =====================================================

const localCompare = (spokenText, correctText) => {
  const spokenWords = stripHtml(spokenText).split(/\s+/).filter(Boolean);
  const correctWords = stripHtml(correctText).split(/\s+/).filter(Boolean);
  const waqfWordIndices = getAllWaqfPositions(correctText).map(w => w.wordIndex);
  
  if (!correctWords.length) return { isCorrect: false, accuracy: 0, wrongWords: [] };
  
  const wrongWords = [];
  let matchCount = 0;
  let spokenIdx = 0;
  
  for (let i = 0; i < correctWords.length; i++) {
    const cWord = correctWords[i];
    const isAtWaqf = waqfWordIndices.includes(i);
    
    if (spokenIdx < spokenWords.length) {
      const sWord = spokenWords[spokenIdx];
      
      // Check with waqf rules
      const waqfMatch = compareWithWaqfRules(sWord, cWord, isAtWaqf);
      const soundMatchResult = soundMatch(sWord, cWord);
      const harakatOnly = areDifferentOnlyInHarakat(sWord, cWord);
      const vowelEq = areVowelEquivalent(sWord, cWord);
      
      if (waqfMatch || soundMatchResult || harakatOnly || vowelEq) {
        matchCount++;
        spokenIdx++;
      } 
      else if (spokenIdx + 1 < spokenWords.length) {
        const mergedWord = spokenWords[spokenIdx] + spokenWords[spokenIdx + 1];
        const mergedWaqfMatch = compareWithWaqfRules(mergedWord, cWord, isAtWaqf);
        const mergedSoundMatch = soundMatch(mergedWord, cWord);
        
        if (mergedWaqfMatch || mergedSoundMatch) {
          matchCount++;
          spokenIdx += 2;
        } else {
          wrongWords.push({
            position: i + 1,
            userWord: sWord,
            correctWord: cWord,
            errorType: 'substitution'
          });
          spokenIdx++;
        }
      }
      else {
        wrongWords.push({
          position: i + 1,
          userWord: sWord,
          correctWord: cWord,
          errorType: 'substitution'
        });
        spokenIdx++;
      }
    } else {
      wrongWords.push({
        position: i + 1,
        userWord: null,
        correctWord: cWord,
        errorType: 'missing'
      });
    }
  }
  
  // Handle extra words
  while (spokenIdx < spokenWords.length) {
    const extraWord = spokenWords[spokenIdx];
    if (extraWord !== 'و' && extraWord !== 'وَا') {
      wrongWords.push({
        position: correctWords.length + 1,
        userWord: extraWord,
        correctWord: null,
        errorType: 'extra'
      });
    } else {
      matchCount++;
    }
    spokenIdx++;
  }
  
  const accuracy = Math.round((matchCount / correctWords.length) * 100);
  return { isCorrect: accuracy >= 85, accuracy, wrongWords };
};

// =====================================================
// FETCH AYAH FROM DATABASE
// =====================================================

const fetchAyahFromDB = async (query) => {
  try {
    console.log('🔍 DB query:', JSON.stringify(query));
    const ayah = await Ayah.findOne(query).lean();
    if (!ayah) console.warn('⚠️ No ayah found for query:', query);
    return ayah || null;
  } catch (err) {
    console.error('❌ DB fetch error:', err.message);
    return null;
  }
};

// =====================================================
// FILTER WRONG WORDS (ONLY REAL ERRORS)
// =====================================================

const filterRealErrors = (wordResults, threshold) => {
  return wordResults
    .filter(w => {
      // Skip if word is correct
      if (w.status === 'correct') return false;
      
      // Skip if difference is only harakat
      if (w.isOnlyHarakatDiff) return false;
      
      // Skip if vowel equivalence
      if (w.isVowelEqDiff) return false;
      
      // Skip if waqf rule applied
      if (w.waqfRuleApplied) return false;
      
      // Skip if high similarity
      if (w.similarity >= threshold) return false;
      
      // Check base letters - if same, it's harakat only
      if (w.userWord && w.correctWord) {
        const userBase = getBaseLetters(w.userWord);
        const correctBase = getBaseLetters(w.correctWord);
        const userClean = getCleanedWord(w.userWord);
        const correctClean = getCleanedWord(w.correctWord);
        
        if (userBase === correctBase || userClean === correctClean) {
          console.log(`✅ Ignoring vowel-only difference: "${w.userWord}" vs "${w.correctWord}"`);
          return false;
        }
      }
      
      // This is a real error
      return true;
    })
    .map(w => ({
      position: w.position,
      userWord: w.userWord,
      correctWord: w.correctWord,
      userRoman: w.userRoman,
      correctRoman: w.correctRoman,
      errorType: w.status === 'close' ? 'close_match' : w.status,
      similarity: w.similarity,
      isAtWaqf: w.isAtWaqf
    }));
};

// =====================================================
// MAIN SOCKET SETUP
// =====================================================

export const setupRecitationSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    let session = {
      active: false,
      ready: false,
      ayah: null,
      correctText: '',
      correctTextClean: '',
      lastWrongWords: [],
      processingAudio: false,
      pendingChunks: [],
      romanCorrect: '',
      waqfPositions: []
    };

    // =================================================
    // START RECITATION
    // =================================================
    socket.on('start-recitation', async (data) => {
      const { suraIndex, ayaIndex, pageNo, paraNo } = data || {};
      console.log('📖 start-recitation:', { suraIndex, ayaIndex, pageNo, paraNo });

      session = {
        active: true,
        ready: false,
        ayah: null,
        correctText: '',
        correctTextClean: '',
        lastWrongWords: [],
        processingAudio: false,
        pendingChunks: [],
        romanCorrect: '',
        waqfPositions: []
      };

      let query = null;
      if (suraIndex != null && ayaIndex != null) {
        query = { suraIndex: Number(suraIndex), ayaIndex: Number(ayaIndex) };
      } else if (pageNo != null && paraNo != null) {
        query = { page_no: Number(pageNo), para_no: Number(paraNo) };
      } else if (pageNo != null) {
        query = { page_no: Number(pageNo) };
      }

      if (!query) {
        socket.emit('recitation-error', { message: 'Invalid parameters' });
        session.active = false;
        return;
      }

      const ayah = await fetchAyahFromDB(query);
      if (!ayah) {
        socket.emit('recitation-error', { message: `Ayah not found: ${JSON.stringify(query)}` });
        session.active = false;
        return;
      }

      session.ayah = ayah;
      session.correctText = ayah.text || '';
      session.correctTextClean = stripHtml(session.correctText);
      
      // Convert to Roman for logging
      session.romanCorrect = convertToRoman(session.correctTextClean, false);
      session.waqfPositions = detectWaqfPositions(session.correctText);
      
      session.ready = true;

      console.log(`✅ Ready: Surah ${ayah.suraIndex}, Ayah ${ayah.ayaIndex}`);
      console.log(`📖 Correct text: "${session.correctTextClean}"`);
      console.log(`📝 Correct Roman: "${session.romanCorrect}"`);
      
      // Log waqf positions for debugging
      const waqfWords = getAllWaqfPositions(session.correctText);
      if (waqfWords.length > 0) {
        console.log(`🛑 Waqf positions found: ${waqfWords.length}`);
        waqfWords.forEach(w => {
          console.log(`   - Word ${w.wordIndex + 1}: "${w.word}" (${w.type})`);
        });
      }
      
      socket.emit('recitation-ready', {
        suraIndex: ayah.suraIndex,
        ayaIndex: ayah.ayaIndex,
        text: ayah.text,
        textTajweed: ayah.textTajweed,
        surahName: ayah.surah_name || '',
        paraName: ayah.para_name || '',
        romanText: session.romanCorrect,
        waqfPositions: waqfWords
      });

      if (session.pendingChunks.length > 0) {
        const chunks = [...session.pendingChunks];
        session.pendingChunks = [];
        for (const chunk of chunks) {
          await processAudioChunk(socket, session, chunk);
        }
      }
    });

    // =================================================
    // AUDIO CHUNK HANDLER
    // =================================================
    socket.on('audio-chunk', async (data) => {
      if (!session.active) return;
      if (!session.ready) {
        session.pendingChunks.push(data);
        return;
      }
      await processAudioChunk(socket, session, data);
    });

    // =================================================
    // COMPLETE RECITATION
    // =================================================
    socket.on('complete-recitation', () => {
      socket.emit('session-complete', {
        duration: 0,
        suraIndex: session.ayah?.suraIndex,
        ayaIndex: session.ayah?.ayaIndex,
        message: 'Recitation session completed',
      });
      session.active = false;
      session.ready = false;
    });

    // =================================================
    // CANCEL RECITATION
    // =================================================
    socket.on('cancel-recitation', () => {
      session.active = false;
      session.ready = false;
      session.pendingChunks = [];
      socket.emit('recitation-cancelled', { message: 'Cancelled' });
    });

    // =================================================
    // DISCONNECT
    // =================================================
    socket.on('disconnect', () => {
      console.log(`🔴 Disconnected: ${socket.id}`);
      session.active = false;
      session.ready = false;
      session.pendingChunks = [];
    });
  });
};

// =====================================================
// PROCESS AUDIO CHUNK (MAIN LOGIC)
// =====================================================

const processAudioChunk = async (socket, session, data) => {
  if (!session.active || !session.ready || !session.correctText) return;
  if (session.processingAudio) {
    console.log('⏳ Already processing');
    return;
  }

  session.processingAudio = true;
  
  try {
    const base64Audio = data?.audio;
    if (!base64Audio) {
      session.processingAudio = false;
      return;
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    if (audioBuffer.length < 1000) {
      session.processingAudio = false;
      return;
    }

    console.log(`🎵 Audio: ${audioBuffer.length} bytes`);

    // Step 1: Speech to Text
    const spokenText = await transcribeAudioToArabic(audioBuffer);
    if (!spokenText || spokenText.length < 2) {
      session.processingAudio = false;
      return;
    }

    const spokenTextClean = stripHtml(spokenText);
    const correctTextClean = session.correctTextClean;

    console.log(`🗣️ Spoken: "${spokenTextClean}"`);
    console.log(`📖 Correct: "${correctTextClean}"`);

    // Log word counts for speed detection
    console.log(`📊 Word count - Spoken: ${spokenTextClean.split(/\s+/).length}, Correct: ${correctTextClean.split(/\s+/).length}`);

    // Convert to Roman for debugging
    const spokenRoman = convertToRoman(spokenTextClean, true);
    console.log(`🔊 Spoken Roman: "${spokenRoman}"`);

    // Step 2: Word-level verification with waqf sound rules
    const wordVerification = verifyWordByWord(
      spokenTextClean, 
      correctTextClean, 
      session.waqfPositions
    );
    
    console.log(`📊 Word verification: ${wordVerification.accuracy}% accuracy`);
    console.log(`✅ Correct words: ${wordVerification.correctCount}/${wordVerification.totalWords}`);
    
    // Log each word result for debugging
    wordVerification.wordResults.forEach((word, idx) => {
      const statusIcon = word.status === 'correct' ? '✅' : (word.status === 'close' ? '⚠️' : '❌');
      const waqfIcon = word.isAtWaqf ? '🛑' : '';
      console.log(`  ${statusIcon}${waqfIcon} Word ${idx+1}: "${word.correctWord}" -> "${word.userWord || 'MISSING'}" [${word.status}]`);
      if (word.mergedUsed) {
        console.log(`     └─ Merged word detected (fast recitation)`);
      }
      if (word.isOnlyHarakatDiff) {
        console.log(`     └─ Harakat-only difference ignored (khara zabar vs zabar)`);
      }
      if (word.isVowelEqDiff) {
        console.log(`     └─ Alif/Zabar equivalence: same sound accepted`);
      }
      if (word.waqfRuleApplied) {
        console.log(`     └─ Waqf sound rule applied (tanween → alif/sukun)`);
      }
    });

    // Step 3: Filter wrong words - ONLY show REAL errors
    const threshold = getAdaptiveThreshold(spokenTextClean, correctTextClean);
    const displayErrors = filterRealErrors(wordVerification.wordResults, threshold);

    // Step 4: Determine final result
    let finalResult;
    
    if (wordVerification.accuracy >= 85) {
      finalResult = {
        isCorrect: wordVerification.accuracy >= 85,
        accuracy: wordVerification.accuracy,
        wrongWords: displayErrors,
        transcribedText: spokenTextClean,
        spokenRoman,
        correctRoman: session.romanCorrect,
        method: 'word-verification',
        waqfApplied: true
      };
    } else {
      // Try AI fallback
      const aiResult = await compareWithGroqAI(spokenTextClean, correctTextClean);
      if (aiResult && aiResult.accuracy > 0) {
        finalResult = {
          ...aiResult,
          transcribedText: spokenTextClean,
          spokenRoman,
          correctRoman: session.romanCorrect,
          method: 'ai-fallback',
          waqfApplied: true
        };
      } else {
        const localResult = localCompare(spokenTextClean, correctTextClean);
        finalResult = {
          ...localResult,
          transcribedText: spokenTextClean,
          spokenRoman,
          correctRoman: session.romanCorrect,
          method: 'local-fallback',
          waqfApplied: true
        };
      }
    }

    console.log(`🎯 Final accuracy: ${finalResult.accuracy}% (${finalResult.method})`);
    console.log(`✅ Is correct: ${finalResult.isCorrect}`);
    console.log(`📋 Wrong words to display: ${finalResult.wrongWords.length}`);

    // Deduplicate wrong words
    const currentKey = (finalResult.wrongWords || []).map(w => `${w.position}:${w.userWord}:${w.correctWord}`).join('|');
    const lastKey = (session.lastWrongWords || []).map(w => `${w.position}:${w.userWord}:${w.correctWord}`).join('|');
    
    if (currentKey && currentKey === lastKey && finalResult.wrongWords.length > 0) {
      console.log('♻️ Duplicate result - skipping emit');
      session.processingAudio = false;
      return;
    }

    session.lastWrongWords = finalResult.wrongWords;

    // Emit verification result
    socket.emit('verification-result', {
      transcribedText: finalResult.transcribedText,
      accuracy: finalResult.accuracy,
      isPerfect: finalResult.accuracy >= 95,
      wrongWords: finalResult.wrongWords || [],
      correctText: session.correctText,
      spokenRoman: finalResult.spokenRoman,
      correctRoman: finalResult.correctRoman,
      wordResults: wordVerification.wordResults,
      waqfPositions: wordVerification.waqfWordIndices,
      timestamp: Date.now(),
    });

    if (finalResult.accuracy >= 95) {
      session.lastWrongWords = [];
    }

  } catch (err) {
    console.error('❌ processAudioChunk errors:', err.message);
    socket.emit('recitation-error', { message: 'Audio processing failed: ' + err.message });
  } finally {
    session.processingAudio = false;
  }
};
