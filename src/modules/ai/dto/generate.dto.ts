import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateRequest {
  @IsString({ message: 'prompt must be a string' })
  @IsNotEmpty({ message: 'prompt is required' })
  prompt: string;
}

export class GenerateResponse {
  response: string;
}
