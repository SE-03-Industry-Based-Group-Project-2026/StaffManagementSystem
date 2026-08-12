const { GoogleGenAI } = require('@google/genai');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    'GEMINI_API_KEY is missing. Translation fallback will be used.'
  );
}

const ai = API_KEY
  ? new GoogleGenAI({
      apiKey: API_KEY
    })
  : null;

const MODEL =
  process.env.GEMINI_MODEL ||
  'gemini-1.5-flash';

const sleep = (milliseconds) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );


function extractJson(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');

  if (
    startIndex === -1 ||
    endIndex === -1 ||
    endIndex < startIndex
  ) {
    throw new Error(
      'Gemini response did not contain a JSON object'
    );
  }

  return cleaned.slice(
    startIndex,
    endIndex + 1
  );
}

function createFallback(text) {
  const cleanText = String(text || '').trim();

  return {
    en: cleanText,
    si: cleanText,
    ta: cleanText
  };
}

function normalizeTranslation(parsed, originalText) {
  const fallback = createFallback(originalText);

  return {
    en:
      typeof parsed?.en === 'string' &&
      parsed.en.trim()
        ? parsed.en.trim()
        : fallback.en,

    si:
      typeof parsed?.si === 'string' &&
      parsed.si.trim()
        ? parsed.si.trim()
        : fallback.si,

    ta:
      typeof parsed?.ta === 'string' &&
      parsed.ta.trim()
        ? parsed.ta.trim()
        : fallback.ta
  };
}


async function translateToAllLanguages(text) {
  const cleanText = String(text || '').trim();

  if (!cleanText) {
    return {
      en: '',
      si: '',
      ta: ''
    };
  }

  if (!ai) {
    return createFallback(cleanText);
  }

  const prompt = `
Translate the following text accurately into English, Sinhala and Tamil.

Return only one valid JSON object.
Do not add Markdown.
Do not add explanations.
Do not add text before or after the JSON.

Required JSON structure:
{
  "en": "English translation",
  "si": "Sinhala translation",
  "ta": "Tamil translation"
}

Preserve names, dates, numbers, email addresses and official terms.

Text:
${cleanText}
`;

  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: {
            responseMimeType:
              'application/json',
            temperature: 0
          }
        });

      const responseText =
        response?.text || '';

      if (!responseText.trim()) {
        throw new Error(
          'Gemini returned an empty response'
        );
      }

      const jsonText =
        extractJson(responseText);

      const parsed =
        JSON.parse(jsonText);

      return normalizeTranslation(
        parsed,
        cleanText
      );
    } catch (error) {
      const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

      console.error(
        `Translation attempt ${attempt}/${maxAttempts} failed using model ${MODEL}:`,
        error?.message || error
      );

      const retryable =
        Number(status) === 429 ||
        Number(status) === 500 ||
        Number(status) === 502 ||
        Number(status) === 503 ||
        Number(status) === 504 ||
        String(error?.message || '')
          .toLowerCase()
          .includes('high demand') ||
        String(error?.message || '')
          .toLowerCase()
          .includes('unavailable');

      if (
        retryable &&
        attempt < maxAttempts
      ) {
        await sleep(attempt * 1500);
        continue;
      }

      console.warn(
        'Translation unavailable. Original text fallback is being used.'
      );

      return createFallback(cleanText);
    }
  }

  return createFallback(cleanText);
}

module.exports = {
  translateToAllLanguages
};