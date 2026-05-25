import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PromptsService,
  SummaryLength,
  AnalysisTask,
  GenerationStyle,
} from './prompts/prompts.service';

@Injectable()
export class GeminiService {
  private axiosClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1';

  constructor(private promptsService: PromptsService) {
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
    length: SummaryLength = 'medium',
  ): Promise<{
    summary: string;
    promptTokens?: number;
    completionTokens?: number;
  }> {
    const prompt = this.promptsService.getSummaryPrompt(title, content, length);
    const config = this.promptsService.getSummaryConfig(length);

    try {
      const response = await this.axiosClient.post(
        `/models/${this.model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: config.maxOutputTokens,
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

      const summary =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!summary) {
        throw new Error('No summary generated');
      }

      const usage = response.data.usageMetadata;
      const promptTokens = usage?.promptTokenCount;
      const completionTokens = usage?.candidatesTokenCount;

      return { summary, promptTokens, completionTokens };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<{
    translatedText: string;
    detectedLanguage: string;
    promptTokens?: number;
    completionTokens?: number;
  }> {
    const prompt = this.promptsService.getTranslationPrompt(
      text,
      targetLanguage,
      sourceLanguage,
    );

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

      const translatedText =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!translatedText) {
        throw new Error('No translation generated');
      }

      const usage = response.data.usageMetadata;
      const promptTokens = usage?.promptTokenCount;
      const completionTokens = usage?.candidatesTokenCount;
      const detectedLanguage = sourceLanguage || 'auto-detected';

      return {
        translatedText,
        detectedLanguage,
        promptTokens,
        completionTokens,
      };
    } catch (error) {
      console.error('Gemini translation error:', error);
      throw new Error('Failed to translate article');
    }
  }

  async analyzeArticle(
    title: string,
    content: string,
    task: AnalysisTask = 'review',
  ): Promise<{
    analysis: string;
    suggestions: string[];
    severity: 'info' | 'warning' | 'error';
    promptTokens?: number;
    completionTokens?: number;
  }> {
    if (content.length < 200) {
      return {
        analysis: `Article "${title}" is too short for meaningful analysis. Content length: ${content.length} characters.`,
        suggestions: [
          'Add more detailed content (minimum 500 characters recommended)',
          'Include examples and practical applications',
        ],
        severity: 'warning',
      };
    }

    const prompt = this.promptsService.getAnalysisPrompt(title, content, task);

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

      let text =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const result = JSON.parse(text);

      const usage = response.data.usageMetadata;
      const promptTokens = usage?.promptTokenCount;
      const completionTokens = usage?.candidatesTokenCount;

      return {
        analysis:
          result.analysis?.substring(0, 150) ||
          `Analysis of "${title}" completed.`,
        suggestions: result.suggestions?.slice(0, 2) || [
          'Add more examples',
          'Improve structure',
        ],
        severity:
          result.severity === 'warning'
            ? 'warning'
            : result.severity === 'error'
              ? 'error'
              : 'info',
        promptTokens,
        completionTokens,
      };
    } catch (error) {
      console.error('Parse error:', error);
      return {
        analysis: `Unable to analyze "${title}". Content may be too short or invalid.`,
        suggestions: [
          'Ensure article has sufficient content (500+ characters)',
          'Check for complete sentences',
        ],
        severity: 'warning',
      };
    }
  }

  async generateFreeText(
    prompt: string,
    style: GenerationStyle = 'balanced',
  ): Promise<{
    text: string;
    promptTokens?: number;
    completionTokens?: number;
  }> {
    const fullPrompt = this.promptsService.getGenerationPrompt(prompt, style);
    const config = this.promptsService.getGenerationConfig(style);

    try {
      const response = await this.axiosClient.post(
        `/models/${this.model}:generateContent`,
        {
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: 500,
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

      const text =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!text) {
        throw new Error('No response generated');
      }

      const usage = response.data.usageMetadata;
      const promptTokens = usage?.promptTokenCount;
      const completionTokens = usage?.candidatesTokenCount;

      return { text, promptTokens, completionTokens };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async generateRagAnswer(
    question: string,
    context: Array<{ title: string; content: string }>,
  ): Promise<string> {
    const contextText = context
      .map((c, i) => `[${i + 1}] Title: ${c.title}\nContent: ${c.content}\n`)
      .join('\n');

    const prompt = `You are a helpful assistant for a Knowledge Hub platform. Answer the user's question based ONLY on the provided context articles.

CONTEXT ARTICLES:
${contextText}

USER QUESTION: ${question}

INSTRUCTIONS:
- Answer based ONLY on the context above
- If the answer cannot be found in the context, say "I cannot find relevant information in the knowledge base"
- Be concise and helpful
- Do not make up information
- Cite sources by mentioning the article titles

ANSWER:`;

    const response = await this.axiosClient.post(
      `/models/${this.model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
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

    const answer =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!answer) {
      throw new Error('No answer generated');
    }

    return answer;
  }
}
