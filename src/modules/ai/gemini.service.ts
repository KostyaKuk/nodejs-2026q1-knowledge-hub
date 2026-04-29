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
}