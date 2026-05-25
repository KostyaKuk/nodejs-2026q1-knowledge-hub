import { Injectable } from '@nestjs/common';

export type SummaryLength = 'short' | 'medium' | 'detailed';
export type AnalysisTask = 'review' | 'bugs' | 'optimize' | 'explain';
export type GenerationStyle = 'creative' | 'balanced' | 'precise';

@Injectable()
export class PromptsService {
  private readonly summaryConfig = {
    short: {
      instruction:
        'Respond with EXACTLY 1-2 sentences. Maximum 45 words. Be extremely concise.',
      maxOutputTokens: 120,
    },
    medium: {
      instruction:
        'Respond with 1-2 paragraphs. Total length must be between 100 and 180 words.',
      maxOutputTokens: 350,
    },
    detailed: {
      instruction:
        'Respond with 2-4 paragraphs. Total length must be between 200 and 380 words.',
      maxOutputTokens: 700,
    },
  };

  private readonly analysisTasks = {
    review: {
      instruction: 'Review quality and completeness',
      systemPrompt: 'You are a professional content reviewer.',
    },
    bugs: {
      instruction: 'Find technical errors, logical flaws, or factual mistakes',
      systemPrompt:
        'You are a technical reviewer specializing in finding bugs and errors.',
    },
    optimize: {
      instruction: 'Suggest SEO and readability improvements',
      systemPrompt: 'You are an SEO and readability specialist.',
    },
    explain: {
      instruction: 'Assess clarity and explain complex concepts',
      systemPrompt: 'You are an educator who simplifies complex topics.',
    },
  };

  private readonly generationStyles = {
    creative: { temperature: 0.8, instruction: 'Be creative and engaging' },
    balanced: { temperature: 0.5, instruction: 'Be balanced and informative' },
    precise: { temperature: 0.2, instruction: 'Be precise and factual' },
  };

  getSummaryPrompt(
    title: string,
    content: string,
    length: SummaryLength,
  ): string {
    const config = this.summaryConfig[length];

    return `You are an expert summary writer.

Create a ${length} summary for the following article.

Title: ${title}
Content: ${content.substring(0, 6000)}

STRICT REQUIREMENTS:
- ${config.instruction}
- Focus only on the most important ideas and key points.
- Use clear, professional and concise language.
- Do NOT add any introductory or concluding phrases.
- Do NOT use meta-commentary.
- Output ONLY the summary text. Nothing else.

Summary:`;
  }

  getSummaryConfig(length: SummaryLength) {
    return this.summaryConfig[length];
  }

  getTranslationPrompt(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): string {
    const sourceInstruction = sourceLanguage
      ? `The source language is ${sourceLanguage}.`
      : `Detect the source language automatically.`;

    return `You are a professional translator. Translate the following text to ${targetLanguage}.

${sourceInstruction}

Text to translate:
${text.substring(0, 5000)}

STRICT REQUIREMENTS:
- Output ONLY the translated text
- Do NOT add any introductory phrases
- Do NOT add any meta-commentary
- Do NOT include the original text
- Keep the meaning, tone, and style of the original

Translated text:`;
  }

  getAnalysisPrompt(
    title: string,
    content: string,
    task: AnalysisTask,
  ): string {
    const taskConfig = this.analysisTasks[task];

    return `${taskConfig.systemPrompt}

Task: ${taskConfig.instruction}

Title: ${title}
Content: ${content}

Return ONLY valid JSON in this exact format:
{
  "analysis": "your analysis here (one sentence, max 100 chars)",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "severity": "info"
}`;
  }

  getAnalysisTaskConfig(task: AnalysisTask) {
    return this.analysisTasks[task];
  }

  getGenerationPrompt(prompt: string, style: GenerationStyle): string {
    const styleConfig = this.generationStyles[style];

    return `You are a helpful AI assistant for a Knowledge Hub platform.

${styleConfig.instruction}

Generate a response based on the user's prompt.
Output ONLY the response text. No meta-commentary.

User prompt: ${prompt}

Response:`;
  }

  getGenerationConfig(style: GenerationStyle) {
    return this.generationStyles[style];
  }
}
