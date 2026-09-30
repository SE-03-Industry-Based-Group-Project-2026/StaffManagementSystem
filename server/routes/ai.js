// server/routes/ai.js
// Gemini-powered multilingual rewriter for leave reasons.
// Singlish -> Sinhala Unicode
// Tanglish -> Tamil Unicode
// Broken English -> Correct natural English

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

const LANGUAGE_NAMES = {
  si: 'Sinhala',
  en: 'English',
  ta: 'Tamil',
};

router.post('/leave-reason', async (req, res) => {
  try {
    const {
      text,
      targetLanguage = 'si',
      leaveType = '',
    } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        message: 'Reason text is required.',
      });
    }

    const cleanText = text.trim();

    if (cleanText.length > 500) {
      return res.status(400).json({
        message: 'Reason must be 500 characters or fewer.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        message: 'AI service is not configured.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const language =
      LANGUAGE_NAMES[targetLanguage] || LANGUAGE_NAMES.si;

   const prompt = `
Rewrite the complete user input without shortening or adding information.

Rules:
- Singlish -> natural Sinhala Unicode
- Broken English -> correct natural English
- Tanglish -> natural Tamil Unicode
- Preserve the complete meaning
- Return one complete sentence only
- No explanation, quotes, headings, or markdown
- Convert all sentences into the Formal language language 

Target language: ${language}
Input: ${cleanText}
`.trim();

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      },
    });

    const rawOutput = String(response.text || '').trim();

    const reason = rawOutput
      .replace(/^```[\w-]*\s*/i, '')
      .replace(/```$/i, '')
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
      .trim();

    console.log('AI INPUT:', cleanText);
    console.log('AI RAW OUTPUT:', rawOutput);
    console.log('AI FINAL OUTPUT:', reason);

    if (!reason) {
      return res.status(502).json({
        message: 'AI returned an empty response.',
      });
    }

    if (reason.length < 8) {
      return res.status(502).json({
        message: 'AI returned an incomplete response.',
        reason,
      });
    }

    return res.json({ reason });
  } catch (error) {
    console.error('Gemini leave reason error:', error);

    return res.status(500).json({
      message: 'Unable to process the reason right now.',
      error: error?.message || String(error),
    });
  }
});

module.exports = router;
