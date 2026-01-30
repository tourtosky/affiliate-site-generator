export interface Project {
  id: string;
  name: string;
  slug: string;
  status: ProjectStatus;

  // Brand Info
  brandName: string;
  brandDescription?: string;
  amazonTrackingId: string;
  amazonMarketplace: string;

  // Colors
  brandColors: BrandColors;

  // Configuration
  template: string;
  selectedBlocks: string[];
  selectedPages: string[];
  languages: string[];
  defaultLanguage: string;

  // Assets config
  assetsConfig: AssetsConfig;

  // .htaccess config
  htaccessConfig: HtaccessConfig;

  // Metadata
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedAt?: Date;
  generationCount: number;

  // Relations
  domains?: Domain[];
  products?: Product[];
  ctas?: CTA[];
}

export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface AssetsConfig {
  generateLogo: boolean;
  logoStyle?: string;
  logoText?: string;
  generateFavicon: boolean;
  generateOgImage: boolean;
}

export interface HtaccessConfig {
  enableGzip: boolean;
  enableCaching: boolean;
  forceHttps: boolean;
  wwwRedirect: 'to-www' | 'to-non-www' | 'none';
  customRules?: string;
}

export interface Domain {
  id: string;
  domain: string;
  isPrimary: boolean;
  isRegistered: boolean;
  registrarProvider?: string;
  registrationDate?: Date;
  expirationDate?: Date;
  autoRenew: boolean;
  dnsProvider?: string;
  dnsConfigured: boolean;
  nameservers?: string[];
  sslEnabled: boolean;
  sslProvider?: string;
  sslExpiresAt?: Date;
  cdnEnabled: boolean;
  cdnProvider?: string;
  cdnZoneId?: string;
  verificationStatus: DomainVerificationStatus;
  verificationToken?: string;
  lastCheckedAt?: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DomainVerificationStatus = 'pending' | 'verified' | 'failed';

export interface Product {
  id: string;
  asin: string;
  title?: string;
  customTitle?: string;
  customDescription?: string;
  imageUrl?: string;
  generateImage: boolean;
  sortOrder: number;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedImagePath?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Generation {
  id: string;
  version: number;
  zipPath: string;
  zipSize?: number;
  settingsSnapshot: string;
  pagesGenerated: number;
  imagesGenerated: number;
  totalFiles: number;
  generationTimeMs?: number;
  aiProvider: AIProviderConfig;
  estimatedCost?: number;
  status: GenerationStatus;
  errorLog?: string;
  generationLog?: GenerationLogEntry[];
  projectId: string;
  createdAt: Date;
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AIProviderConfig {
  text: string;
  images: string;
}

export interface GenerationLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

// API types
export interface CreateProjectInput {
  name: string;
  brandName: string;
  brandDescription?: string;
  amazonTrackingId: string;
  amazonMarketplace?: string;
  brandColors?: Partial<BrandColors>;
  template?: string;
  languages?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  brandName?: string;
  brandDescription?: string;
  amazonTrackingId?: string;
  amazonMarketplace?: string;
  brandColors?: Partial<BrandColors>;
  template?: string;
  selectedBlocks?: string[];
  selectedPages?: string[];
  languages?: string[];
  defaultLanguage?: string;
  assetsConfig?: Partial<AssetsConfig>;
  htaccessConfig?: Partial<HtaccessConfig>;
  notes?: string;
  tags?: string[];
  status?: ProjectStatus;
}

export interface CreateProductInput {
  asin: string;
  title?: string;
  customTitle?: string;
  customDescription?: string;
  imageUrl?: string;
  generateImage?: boolean;
}

export interface UpdateProductInput {
  title?: string;
  customTitle?: string;
  customDescription?: string;
  imageUrl?: string;
  generateImage?: boolean;
  sortOrder?: number;
}
