import * as openai from './openai.js';
import * as gemini from './gemini.js';
import type { ContentGenerationRequest, GeneratedContent } from './openai.js';

export type AIProvider = 'openai' | 'gemini';

export interface AIStatus {
  openai: boolean;
  gemini: boolean;
  anyConfigured: boolean;
  defaultProvider: AIProvider | null;
}

export function getAIStatus(): AIStatus {
  const openaiConfigured = openai.isOpenAIConfigured();
  const geminiConfigured = gemini.isGeminiConfigured();

  return {
    openai: openaiConfigured,
    gemini: geminiConfigured,
    anyConfigured: openaiConfigured || geminiConfigured,
    defaultProvider: openaiConfigured ? 'openai' : geminiConfigured ? 'gemini' : null,
  };
}

export async function generateContent(
  request: ContentGenerationRequest,
  provider?: AIProvider
): Promise<GeneratedContent> {
  const status = getAIStatus();

  if (!status.anyConfigured) {
    throw new Error('No AI provider configured. Please add API keys in settings.');
  }

  // Use specified provider or default
  const selectedProvider = provider || status.defaultProvider;

  if (selectedProvider === 'openai' && status.openai) {
    console.log('Using OpenAI for content generation...');
    return openai.generateContent(request);
  }

  if (selectedProvider === 'gemini' && status.gemini) {
    console.log('Using Gemini for content generation...');
    return gemini.generateContent(request);
  }

  // Fallback to any available provider
  if (status.openai) {
    console.log('Falling back to OpenAI...');
    return openai.generateContent(request);
  }

  if (status.gemini) {
    console.log('Falling back to Gemini...');
    return gemini.generateContent(request);
  }

  throw new Error('No AI provider available');
}

export async function generateProductDescription(
  productTitle: string,
  brandName: string,
  brandDescription?: string,
  provider?: AIProvider
): Promise<{ title: string; description: string }> {
  const status = getAIStatus();

  if (!status.anyConfigured) {
    throw new Error('No AI provider configured');
  }

  const selectedProvider = provider || status.defaultProvider;

  if (selectedProvider === 'openai' && status.openai) {
    return openai.generateProductDescription(productTitle, brandName, brandDescription);
  }

  if (selectedProvider === 'gemini' && status.gemini) {
    return gemini.generateProductDescription(productTitle, brandName, brandDescription);
  }

  if (status.openai) {
    return openai.generateProductDescription(productTitle, brandName, brandDescription);
  }

  if (status.gemini) {
    return gemini.generateProductDescription(productTitle, brandName, brandDescription);
  }

  throw new Error('No AI provider available');
}

// Re-export types
export type { ContentGenerationRequest, GeneratedContent } from './openai.js';
