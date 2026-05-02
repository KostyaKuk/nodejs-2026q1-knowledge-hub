import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GeminiService {
  private axiosClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000,
    });
  }

  async generateSummary(
    title: string,
    content: string,
    maxLength: 'short' | 'medium' | 'detailed' = 'medium',
  ): Promise<string> {
    const config = {
      short: {
        instruction: 'Respond with EXACTLY 1-2 sentences. Maximum 45 words. Be extremely concise.',
        maxOutputTokens: 120,
      },
      medium: {
        instruction: 'Respond with 1-2 paragraphs. Total length must be between 100 and 180 words.',
        maxOutputTokens: 350,
      },
      detailed: {
        instruction: 'Respond with 2-4 paragraphs. Total length must be between 200 and 380 words.',
        maxOutputTokens: 700,
      },
    };

    const selected = config[maxLength];

    const prompt = `You are an expert summary writer.

Create a ${maxLength} summary for the following article.

Title: ${title}
Content: ${content.substring(0, 6000)}

STRICT REQUIREMENTS:
- ${selected.instruction}
- Focus only on the most important ideas and key points.
- Use clear, professional and concise language.
- Do NOT add any introductory or concluding phrases like "This article...", "In summary...", "Here is a summary...".
- Do NOT use meta-commentary.
- Output ONLY the summary text. Nothing else.

Summary:`;

    try {
      const response = await this.axiosClient.post(
        `/models/${this.model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: selected.maxOutputTokens,
            topP: 0.95,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
        },
      );

      let summary = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!summary) {
        throw new Error('No summary generated');
      }
      return summary;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<{ translatedText: string; detectedLanguage: string }> {
  const sourceInstruction = sourceLanguage
    ? `The source language is ${sourceLanguage}.`
    : `Detect the source language automatically.`;

  const prompt = `You are a professional translator. Translate the following text to ${targetLanguage}.

${sourceInstruction}

Text to translate:
${text.substring(0, 5000)}

STRICT REQUIREMENTS:
- Output ONLY the translated text
- Do NOT add any introductory phrases like "Here is the translation"
- Do NOT add any meta-commentary
- Do NOT include the original text
- Keep the meaning, tone, and style of the original

Translated text:`;

  try {
    const response = await this.axiosClient.post(
      `/models/${this.model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
          topP: 0.95,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
      },
    );

    let translatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!translatedText) {
      throw new Error('No translation generated');
    }

    const detectedLanguage = sourceLanguage || 'auto-detected';

    return {
      translatedText,
      detectedLanguage,
    };
  } catch (error) {
    console.error('Gemini translation error:', error);
    throw new Error('Failed to translate article');
  }
}

async analyzeArticle(
  title: string,
  content: string,
  task: 'review' | 'bugs' | 'optimize' | 'explain' = 'review',
): Promise<{ analysis: string; suggestions: string[]; severity: 'info' | 'warning' | 'error' }> {
  if (content.length < 200) {
    return {
      analysis: `Article "${title}" is too short for meaningful analysis. Content length: ${content.length} characters.`,
      suggestions: [
        'Add more detailed content (minimum 500 characters recommended)',
        'Include examples and practical applications'
      ],
      severity: 'warning',
    };
  }

  const taskInstructions = {
    review: 'Review quality and completeness',
    bugs: 'Find technical errors',
    optimize: 'Suggest SEO and readability improvements',
    explain: 'Assess clarity for beginners',
  };

  const prompt = `Task: ${taskInstructions[task]}

Title: ${title}
Content: ${content}

Return ONLY valid JSON in this exact format:
{
  "analysis": "your analysis here (one sentence, max 100 chars)",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "severity": "info"
}`;

  try {
    const response = await this.axiosClient.post(
      `/models/${this.model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
      },
    );

    let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(text);

    return {
      analysis: result.analysis?.substring(0, 150) || `Analysis of "${title}" completed.`,
      suggestions: result.suggestions?.slice(0, 2) || ['Add more examples', 'Improve structure'],
      severity: result.severity === 'warning' ? 'warning' : result.severity === 'error' ? 'error' : 'info',
    };
  } catch (error) {
    console.error('Parse error:', error);
    return {
      analysis: `Unable to analyze "${title}". Content may be too short or invalid.`,
      suggestions: ['Ensure article has sufficient content (500+ characters)', 'Check for complete sentences'],
      severity: 'warning',
    };
  }
}
}