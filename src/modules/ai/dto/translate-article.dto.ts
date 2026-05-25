import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class TranslateArticleRequest {
  @IsString({ message: 'targetLanguage must be a string' })
  @IsNotEmpty({ message: 'targetLanguage is required' })
  @IsIn(['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'uk', 'pl', 'zh', 'ja'], {
    message: 'targetLanguage must be a valid language code',
  })
  targetLanguage: string;

  @IsOptional()
  @IsString({ message: 'sourceLanguage must be a string' })
  sourceLanguage?: string;
}

export class TranslateArticleResponse {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;
}
