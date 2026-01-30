export interface Settings {
  id: string;

  // API Keys (will be encrypted in storage)
  openaiApiKey?: string;
  geminiApiKey?: string;

  // Default providers
  defaultTextProvider: TextProvider;
  defaultImageProvider: ImageProvider;

  // Default project settings
  defaultProjectSettings?: DefaultProjectSettings;

  // Output settings
  outputDirectory: string;
  keepVersions: number;

  // UI preferences
  theme: Theme;

  updatedAt: Date;
}

export type TextProvider = 'openai' | 'gemini';
export type ImageProvider = 'dalle' | 'imagen';
export type Theme = 'light' | 'dark' | 'system';

export interface DefaultProjectSettings {
  template?: string;
  languages?: string[];
  defaultLanguage?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  htaccessConfig?: {
    enableGzip?: boolean;
    enableCaching?: boolean;
    forceHttps?: boolean;
    wwwRedirect?: 'to-www' | 'to-non-www' | 'none';
  };
}

export interface UpdateSettingsInput {
  openaiApiKey?: string;
  geminiApiKey?: string;
  defaultTextProvider?: TextProvider;
  defaultImageProvider?: ImageProvider;
  defaultProjectSettings?: DefaultProjectSettings;
  outputDirectory?: string;
  keepVersions?: number;
  theme?: Theme;
}

export interface TestApiKeyResult {
  valid: boolean;
  message: string;
  provider: string;
  model?: string;
}
